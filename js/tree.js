/**
 * tree.js — المرحلة 2: بناء شجرة العائلة التفاعلية (عرض بصري بالفروع + لوحة جانبية للتعديل)
 */
(function (global) {
  "use strict";

  const Data = global.JuthoorData;
  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function optionsHtml(list, selected, labelFn, lang) {
    return list
      .map(function (item) {
        const sel = item.id === selected ? "selected" : "";
        const label = labelFn ? labelFn(item, lang) : item.label;
        return '<option value="' + item.id + '" ' + sel + ">" + label + "</option>";
      })
      .join("");
  }

  function sideLabel(side, lang) {
    if (side === "maternal") return I18n.t(lang, "tree.maternal");
    if (side === "paternal") return I18n.t(lang, "tree.paternal");
    return I18n.t(lang, "tree.both");
  }

  function defaultRelationForSide(side) {
    if (side === "maternal") return "mother";
    if (side === "paternal") return "father";
    return "sister";
  }

  function newRelativeForSide(side) {
    const relationId = defaultRelationForSide(side);
    const relation = Data.relationById(relationId);
    const cancerOptions = Data.cancerTypesForGender(relation.gender);
    const cancerType = cancerOptions[0].id;
    const ageBand = Data.AGE_BANDS[cancerType][0].id;
    return {
      id: "r" + Date.now() + Math.floor(Math.random() * 1000),
      relationId: relationId,
      side: relation.side,
      cancerType: cancerType,
      ageBand: ageBand,
      consanguinity: false,
    };
  }

  function toggleFieldRow(field, id, checked, title, desc) {
    return (
      '<label class="toggle-row">' +
        '<span class="toggle-switch ' + (checked ? "on" : "") + '">' +
          '<input type="checkbox" data-field="' + field + '" data-id="' + id + '" ' + (checked ? "checked" : "") + " />" +
          '<span class="knob"></span>' +
        "</span>" +
        "<span>" +
          "<strong>" + title + "</strong>" +
          '<span class="desc">' + desc + "</span>" +
        "</span>" +
      "</label>"
    );
  }

  function buildPanel(relative, lang) {
    if (!relative) return "";
    lang = lang || "ar";
    const T = function (key) { return I18n.t(lang, key); };
    const relation = Data.relationById(relative.relationId) || Data.RELATION_TYPES[0];
    const cancerOptions = Data.cancerTypesForGender(relation.gender);
    const ageBands = Data.AGE_BANDS[relative.cancerType] || Data.AGE_BANDS.breast;

    return (
      '<div class="modal-sheet">' +
        '<div class="modal-head">' +
          "<div>" +
            '<span class="eyebrow">' + sideLabel(relation.side, lang) + "</span>" +
            "<h2>" + Data.relationLabel(relation, lang) + "</h2>" +
          "</div>" +
          '<button class="modal-close" data-action="close-modal" aria-label="Close">' + Icon("x") + "</button>" +
        "</div>" +

        '<div class="field" style="margin-bottom:0.9rem;">' +
          "<label>" + T("tree.panel_relation") + "</label>" +
          '<select data-field="relationId" data-id="' + relative.id + '">' + optionsHtml(Data.RELATION_TYPES, relative.relationId, Data.relationLabel, lang) + "</select>" +
          '<span class="degree-badge">' + T("tree.panel_degree") + " " + Data.relationDegree(relation, lang) + "</span>" +
        "</div>" +

        '<div class="field" style="margin-bottom:0.9rem;">' +
          "<label>" + T("tree.panel_cancer_type") + "</label>" +
          '<select data-field="cancerType" data-id="' + relative.id + '">' + optionsHtml(cancerOptions, relative.cancerType, function (item, l) { return Data.cancerLabel(item.id, l); }, lang) + "</select>" +
        "</div>" +

        '<div class="field">' +
          "<label>" + T("tree.panel_age") + "</label>" +
          '<select data-field="ageBand" data-id="' + relative.id + '">' + optionsHtml(ageBands, relative.ageBand, function (item, l) { return Data.ageLabel(relative.cancerType, item.id, l); }, lang) + "</select>" +
        "</div>" +

        '<div class="panel-flat" style="margin-top:1.1rem;">' +
          toggleFieldRow("consanguinity", relative.id, relative.consanguinity, T("tree.panel_consanguinity_title"), T("tree.panel_consanguinity_desc")) +
        "</div>" +

        '<div class="btn-row between" style="margin-top:1.4rem;">' +
          '<button class="btn btn-danger-text" data-action="remove-relative" data-id="' + relative.id + '">' + Icon("trash") + " " + T("tree.panel_remove") + "</button>" +
          '<button class="btn btn-primary" data-action="close-modal">' + T("tree.panel_done") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function nodeButton(r, lang) {
    const relation = Data.relationById(r.relationId);
    if (!relation) return "";
    const cancer = Data.CANCER_TYPES.find(function (c) { return c.id === r.cancerType; });
    return (
      '<button type="button" class="tree-node-btn" data-action="open-relative" data-id="' + r.id + '">' +
        '<span class="tree-node-avatar">' + Icon("person") + "</span>" +
        '<span class="tree-node-text"><strong>' + Data.relationLabel(relation, lang) + "</strong><span>" + (cancer ? Data.cancerLabel(cancer.id, lang) : "") + "</span></span>" +
      "</button>"
    );
  }

  function branchGroup(side, label, relatives, lang) {
    return (
      '<div class="branch-group ' + side + '">' +
        '<div class="branch-head"><span class="dot"></span>' + label + "</div>" +
        '<div class="branch-line">' +
          (relatives.length ? relatives.map(function (r) { return nodeButton(r, lang); }).join("") : '<div class="branch-empty">' + I18n.t(lang, "tree.empty_branch") + "</div>") +
          '<button type="button" class="tree-add-node" data-action="add-relative" data-side="' + side + '">' + Icon("plus") + " " + I18n.t(lang, "tree.add_relative") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function sharedRow(relatives, lang) {
    return (
      '<div class="branch-group shared" style="margin-top:0.75rem;">' +
        '<div class="branch-head" style="justify-content:center;"><span class="dot"></span>' + I18n.t(lang, "tree.shared_head") + "</div>" +
        '<div class="tree-shared-row">' +
          relatives.map(function (r) { return nodeButton(r, lang); }).join("") +
          '<button type="button" class="tree-add-node" data-action="add-relative" data-side="both">' + Icon("plus") + " " + I18n.t(lang, "tree.add_sibling") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function summaryPills(relatives, lang) {
    const maternal = relatives.filter(function (r) {
      const rel = Data.relationById(r.relationId);
      return rel && (rel.side === "maternal" || rel.side === "both");
    }).length;
    const paternal = relatives.filter(function (r) {
      const rel = Data.relationById(r.relationId);
      return rel && (rel.side === "paternal" || rel.side === "both");
    }).length;
    return (
      '<div class="tree-summary">' +
        '<div class="pill">' + I18n.t(lang, "tree.pill_total") + ' <b class="tabular">' + relatives.length + "</b></div>" +
        '<div class="pill">' + I18n.t(lang, "tree.pill_maternal") + ' <b class="tabular">' + maternal + "</b></div>" +
        '<div class="pill">' + I18n.t(lang, "tree.pill_paternal") + ' <b class="tabular">' + paternal + "</b></div>" +
      "</div>"
    );
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function genomicUploadSection(genomicFile, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const chip = genomicFile
      ? '<div class="upload-chip">' + Icon("file-check") + "<span>" + genomicFile.name + " · " + formatBytes(genomicFile.size) + '</span><button type="button" data-action="remove-genomic-file" aria-label="Remove file">' + Icon("x") + "</button></div>"
      : "";
    return (
      '<div class="upload-field">' +
        Icon("dna") +
        '<div class="upload-body">' +
          "<strong>" + T("tree.upload_title") + "</strong>" +
          '<span class="faint">' + T("tree.upload_desc") + " <b>" + T("tree.upload_desc_bold") + "</b></span>" +
          '<div class="upload-input-row">' +
            '<input type="file" id="genomic-file-input" accept="' + Data.GENOMIC_FILE_ACCEPT + '" data-field="genomicFile" />' +
            chip +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function render(state) {
    const relatives = state.relatives;
    const lang = state.lang;
    const T = function (key) { return I18n.t(lang, key); };
    const maternal = relatives.filter(function (r) { const rel = Data.relationById(r.relationId); return rel && rel.side === "maternal"; });
    const paternal = relatives.filter(function (r) { const rel = Data.relationById(r.relationId); return rel && rel.side === "paternal"; });
    const shared = relatives.filter(function (r) { const rel = Data.relationById(r.relationId); return rel && rel.side === "both"; });

    return (
      '<div class="section-head">' +
        '<span class="eyebrow">' + T("tree.eyebrow") + "</span>" +
        "<h2>" + T("tree.title") + "</h2>" +
        '<p class="subtle">' + T("tree.subtitle") + "</p>" +
      "</div>" +

      '<div class="tree-root">' +
        '<div class="tree-root-node">' + T("tree.root_you") + "</div>" +
        '<div class="tree-root-label">' + T("tree.root_label") + "</div>" +
      "</div>" +

      '<div class="tree-branches">' +
        branchGroup("maternal", T("tree.maternal"), maternal, lang) +
        branchGroup("paternal", T("tree.paternal"), paternal, lang) +
      "</div>" +

      sharedRow(shared, lang) +

      summaryPills(relatives, lang) +

      '<div style="height:0.25rem"></div>' +
      genomicUploadSection(state.genomicFile, lang) +

      '<div class="btn-row between" style="margin-top:0.5rem;">' +
        '<button class="btn btn-text" data-action="go-stage" data-stage="1">' + Icon("chevron-end") + " " + T("tree.back") + "</button>" +
        '<button class="btn btn-primary" data-action="calculate-score">' + T("tree.calculate") + " " + Icon("chevron-start") + "</button>" +
      "</div>"
    );
  }

  global.JuthoorTree = { render: render, buildPanel: buildPanel, newRelativeForSide: newRelativeForSide };
})(window);
