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
      uncertain: false,
      brcaTested: "unknown", // "unknown" | "yes" | "no" — هل أُجري فحص BRCA1/2 فعليًا لهذه القريبة
      brcaResult: "unknown", // "unknown" | "positive" | "negative" | "vus" — ذات معنى فقط لو brcaTested === "yes"
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

        '<div class="field" style="margin-top:1.1rem;">' +
          "<label>" + T("tree.panel_brca_tested_title") + "</label>" +
          '<select data-field="brcaTested" data-id="' + relative.id + '">' +
            brcaTestedOptions(relative.brcaTested, lang) +
          "</select>" +
          '<span class="desc">' + T("tree.panel_brca_tested_desc") + "</span>" +
        "</div>" +

        (relative.brcaTested === "yes"
          ? '<div class="field" style="margin-top:0.9rem;">' +
              "<label>" + T("tree.panel_brca_result_title") + "</label>" +
              '<select data-field="brcaResult" data-id="' + relative.id + '">' +
                brcaResultOptions(relative.brcaResult, lang) +
              "</select>" +
              (relative.brcaResult === "positive"
                ? '<span class="desc" style="color:var(--risk-high);">' + T("tree.panel_brca_positive_note") + "</span>"
                : "") +
            "</div>"
          : "") +

        '<div class="panel-flat" style="margin-top:1.1rem;">' +
          toggleFieldRow("consanguinity", relative.id, relative.consanguinity, T("tree.panel_consanguinity_title"), T("tree.panel_consanguinity_desc")) +
          toggleFieldRow("uncertain", relative.id, relative.uncertain, T("tree.panel_uncertain_title"), T("tree.panel_uncertain_desc")) +
        "</div>" +

        '<div class="btn-row between" style="margin-top:1.4rem;">' +
          '<button class="btn btn-danger-text" data-action="remove-relative" data-id="' + relative.id + '">' + Icon("trash") + " " + T("tree.panel_remove") + "</button>" +
          '<button class="btn btn-primary" data-action="close-modal">' + T("tree.panel_done") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function brcaTestedOptions(selected, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const opts = [
      ["unknown", T("tree.brca_tested_unknown")],
      ["yes", T("tree.brca_tested_yes")],
      ["no", T("tree.brca_tested_no")],
    ];
    return opts
      .map(function (o) { return '<option value="' + o[0] + '" ' + (o[0] === selected ? "selected" : "") + ">" + o[1] + "</option>"; })
      .join("");
  }

  function brcaResultOptions(selected, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const opts = [
      ["unknown", T("tree.brca_result_unknown")],
      ["positive", T("tree.brca_result_positive")],
      ["negative", T("tree.brca_result_negative")],
      ["vus", T("tree.brca_result_vus")],
    ];
    return opts
      .map(function (o) { return '<option value="' + o[0] + '" ' + (o[0] === selected ? "selected" : "") + ">" + o[1] + "</option>"; })
      .join("");
  }

  function nodeButton(r, lang) {
    const relation = Data.relationById(r.relationId);
    if (!relation) return "";
    const cancer = Data.CANCER_TYPES.find(function (c) { return c.id === r.cancerType; });
    const brcaBadge = r.brcaResult === "positive"
      ? '<span class="tree-node-badge" title="' + I18n.t(lang, "tree.brca_result_positive") + '">' + Icon("dna") + "</span>"
      : "";
    return (
      '<button type="button" class="tree-node-btn" data-action="open-relative" data-id="' + r.id + '">' +
        '<span class="tree-node-avatar">' + Icon("person") + "</span>" +
        '<span class="tree-node-text"><strong>' + Data.relationLabel(relation, lang) + "</strong><span>" + (cancer ? Data.cancerLabel(cancer.id, lang) : "") + "</span></span>" +
        brcaBadge +
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

  function completenessRow(ok, okText, missingText) {
    return (
      '<div class="completeness-row ' + (ok ? "ok" : "missing") + '">' +
        Icon(ok ? "check-circle" : "alert-circle") +
        "<span>" + (ok ? okText : missingText) + "</span>" +
      "</div>"
    );
  }

  function completenessIndicator(relatives, genomicFile, lang) {
    const T = function (key, vars) { return I18n.t(lang, key, vars); };
    const maternalCount = relatives.filter(function (r) { const rel = Data.relationById(r.relationId); return rel && (rel.side === "maternal" || rel.side === "both"); }).length;
    const paternalCount = relatives.filter(function (r) { const rel = Data.relationById(r.relationId); return rel && (rel.side === "paternal" || rel.side === "both"); }).length;
    const uncertainCount = relatives.filter(function (r) { return !!r.uncertain; }).length;

    return (
      '<div class="panel-flat" style="margin-top:0.75rem;">' +
        "<strong>" + T("tree.completeness_title") + "</strong>" +
        '<div class="completeness-list" style="margin-top:0.5rem;">' +
          completenessRow(maternalCount > 0, T("tree.completeness_maternal_ok"), T("tree.completeness_maternal_missing")) +
          completenessRow(paternalCount > 0, T("tree.completeness_paternal_ok"), T("tree.completeness_paternal_missing")) +
          '<div class="completeness-row info">' + Icon(genomicFile ? "file-check" : "info-circle") + "<span>" + (genomicFile ? T("tree.completeness_genomic_attached") : T("tree.completeness_genomic_note")) + "</span></div>" +
          (uncertainCount > 0
            ? '<div class="completeness-row missing">' + Icon("alert-circle") + "<span>" + T("tree.completeness_uncertain_note", { count: uncertainCount }) + "</span></div>"
            : "") +
        "</div>" +
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

  function personalFactorsSection(factors, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const densityOptions = [
      { id: "", label: T("tree.personal_density_unknown") },
      { id: "low", label: T("tree.personal_density_low") },
      { id: "medium", label: T("tree.personal_density_medium") },
      { id: "high", label: T("tree.personal_density_high") },
    ];
    const densitySelect = densityOptions
      .map(function (o) { return '<option value="' + o.id + '" ' + (o.id === (factors.breastDensity || "") ? "selected" : "") + ">" + o.label + "</option>"; })
      .join("");

    return (
      '<div class="panel-flat" style="margin-top:0.75rem;">' +
        "<strong>" + T("tree.personal_title") + "</strong>" +
        '<p class="faint" style="margin-top:0.3rem;margin-bottom:0.9rem;">' + T("tree.personal_desc") + "</p>" +

        '<div class="grid-2">' +
          '<div class="field">' +
            "<label>" + T("tree.personal_menarche") + "</label>" +
            '<input type="number" min="8" max="20" data-personal-field="menarcheAge" value="' + (factors.menarcheAge != null ? factors.menarcheAge : "") + '" />' +
          "</div>" +
          '<div class="field">' +
            "<label>" + T("tree.personal_pregnancies") + "</label>" +
            '<input type="number" min="0" max="20" data-personal-field="pregnancies" value="' + (factors.pregnancies != null ? factors.pregnancies : "") + '" />' +
          "</div>" +
        "</div>" +

        '<div class="grid-2" style="margin-top:0.9rem;">' +
          '<div class="field">' +
            "<label>" + T("tree.personal_height") + "</label>" +
            '<input type="number" min="100" max="220" data-personal-field="heightCm" value="' + (factors.heightCm != null ? factors.heightCm : "") + '" />' +
          "</div>" +
          '<div class="field">' +
            "<label>" + T("tree.personal_weight") + "</label>" +
            '<input type="number" min="25" max="250" data-personal-field="weightKg" value="' + (factors.weightKg != null ? factors.weightKg : "") + '" />' +
          "</div>" +
        "</div>" +

        '<div class="field" style="margin-top:0.9rem;">' +
          "<label>" + T("tree.personal_density_label") + "</label>" +
          '<select data-personal-field="breastDensity">' + densitySelect + "</select>" +
        "</div>" +

        '<div style="margin-top:0.9rem;">' +
          toggleFieldRow2("hormonalUse", factors.hormonalUse, T("tree.personal_hormonal_title"), T("tree.personal_hormonal_desc")) +
          toggleFieldRow2("priorBiopsy", factors.priorBiopsy, T("tree.personal_biopsy_title"), T("tree.personal_biopsy_desc")) +
        "</div>" +
      "</div>"
    );
  }

  function toggleFieldRow2(personalField, checked, title, desc) {
    return (
      '<label class="toggle-row">' +
        '<span class="toggle-switch ' + (checked ? "on" : "") + '">' +
          '<input type="checkbox" data-personal-field="' + personalField + '" ' + (checked ? "checked" : "") + " />" +
          '<span class="knob"></span>' +
        "</span>" +
        "<span>" +
          "<strong>" + title + "</strong>" +
          '<span class="desc">' + desc + "</span>" +
        "</span>" +
      "</label>"
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
      completenessIndicator(relatives, state.genomicFile, lang) +

      '<div style="height:0.25rem"></div>' +
      genomicUploadSection(state.genomicFile, lang) +
      personalFactorsSection(state.personalFactors, lang) +

      '<div class="btn-row between" style="margin-top:0.5rem;">' +
        '<button class="btn btn-text" data-action="go-stage" data-stage="1">' + Icon("chevron-end") + " " + T("tree.back") + "</button>" +
        '<button class="btn btn-primary" data-action="calculate-score">' + T("tree.calculate") + " " + Icon("chevron-start") + "</button>" +
      "</div>"
    );
  }

  global.JuthoorTree = { render: render, buildPanel: buildPanel, newRelativeForSide: newRelativeForSide, personalFactorsSection: personalFactorsSection };
})(window);
