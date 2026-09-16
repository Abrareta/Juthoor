/**
 * results.js — المرحلة 3: عرض نتيجة محرك Manchester Scoring + رحلة ما بعد النتيجة
 */
(function (global) {
  "use strict";

  const Data = global.JuthoorData;
  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function reasonRows(breakdown, lang) {
    if (!breakdown.length) {
      return '<p class="faint">' + I18n.t(lang, "results.no_relatives") + "</p>";
    }
    return (
      '<div class="reason-list">' +
      breakdown
        .map(function (r) {
          const relation = Data.relationById(r.relationId);
          const combinedPts = r.points.brca1 + r.points.brca2;
          return (
            '<div class="reason-row">' +
              "<span>" + Data.relationLabel(relation, lang) + " — " + Data.cancerLabel(r.cancerType, lang) + " (" + Data.ageLabel(r.cancerType, r.ageBand, lang) + ")</span>" +
              '<span class="pts tabular">+' + combinedPts + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function pathwayCards(selectedId, actionName, lang) {
    return (
      '<div class="pathway-grid">' +
      Data.REFERRAL_PATHWAYS
        .map(function (p) {
          const selected = p.id === selectedId ? "selected" : "";
          return (
            '<div class="pathway-card ' + selected + '" data-action="' + actionName + '" data-pathway="' + p.id + '">' +
              '<div class="pathway-icon">' + Icon(p.icon) + "</div>" +
              "<h4>" + Data.pathwayLabel(p, lang) + "</h4>" +
              "<p>" + Data.pathwayDescription(p, lang) + "</p>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function genomicFileNote(genomicFile, lang) {
    if (!genomicFile) return "";
    return (
      '<div class="note-box">' + Icon("file-check") +
      "<span>" + I18n.t(lang, "results.genomic_note", { name: genomicFile.name }) + "</span>" +
      "</div>"
    );
  }

  function distinctionRow(lang) {
    const T = function (key) { return I18n.t(lang, key); };
    return (
      '<div class="distinction-row">' +
        '<div class="distinction-col imaging">' +
          '<span class="tag">' + Icon("hospital") + " " + I18n.t(lang, "common.imaging_tag") + "</span>" +
          "<strong>" + T("results.dist_imaging_title") + "</strong>" +
          '<span class="desc">' + T("results.dist_imaging_desc") + "</span>" +
        "</div>" +
        '<div class="distinction-col genetic">' +
          '<span class="tag">' + Icon("dna") + " " + I18n.t(lang, "common.genetic_tag") + "</span>" +
          "<strong>" + T("results.dist_genetic_title") + "</strong>" +
          '<span class="desc">' + T("results.dist_genetic_desc") + "</span>" +
        "</div>" +
      "</div>"
    );
  }

  function render(state, score, ui) {
    const uiState = ui || {};
    const isHigh = score.band === "high";
    const lang = state.lang;
    const T = function (key) { return I18n.t(lang, key); };

    const referral = global.JuthoorState.getActiveReferral();
    const alreadyReferred = referral && referral.status;

    const consanguinityNote = score.anyConsanguinity
      ? '<div class="note-box">' + Icon("alert-circle") + "<span>" + T("results.consanguinity_note") + "</span></div>"
      : "";

    return (
      '<div class="section-head">' +
        '<span class="eyebrow">' + T("results.eyebrow") + "</span>" +
        "<h2>" + T("results.title") + "</h2>" +
        '<p class="subtle">' + T("results.subtitle") + "</p>" +
      "</div>" +

      '<div class="panel">' +
        '<div class="score-summary">' +
          '<div class="score-figure">' +
            '<span class="num ' + (isHigh ? "high" : "low") + ' tabular">' + score.combined + "</span>" +
            '<span class="lbl">' + T("results.score_label") + "</span>" +
          "</div>" +
          '<div class="score-classification">' +
            '<span class="classification-chip ' + (isHigh ? "high" : "low") + '">' + Icon(isHigh ? "alert-circle" : "check-circle") + " " + (isHigh ? T("results.chip_high") : T("results.chip_low")) + "</span>" +
            "<h3>" + (isHigh ? T("results.headline_high") : T("results.headline_low")) + "</h3>" +
            "<p>" +
              (isHigh
                ? I18n.t(lang, "results.desc_high", { score: score.combined, threshold: Data.THRESHOLDS.combined, single: Data.THRESHOLDS.singleGene })
                : I18n.t(lang, "results.desc_low", { score: score.combined, threshold: Data.THRESHOLDS.combined })) +
            "</p>" +
          "</div>" +
        "</div>" +
      "</div>" +

      distinctionRow(lang) +

      "<h3 class=\"block-title\">" + T("results.why_title") + "</h3>" +
      '<p class="faint" style="margin-top:-0.8rem;">' + T("results.why_desc") + "</p>" +
      reasonRows(score.breakdown, lang) +

      '<div class="side-summary">' +
        '<div class="side-summary-item ' + (score.usedSide === "maternal" ? "used" : "") + '">' +
          '<div class="label">' + T("results.side_maternal") + "</div>" +
          '<div class="value tabular">' + (score.totals.maternal.brca1 + score.totals.maternal.brca2) + "</div>" +
        "</div>" +
        '<div class="side-summary-item ' + (score.usedSide === "paternal" ? "used" : "") + '">' +
          '<div class="label">' + T("results.side_paternal") + "</div>" +
          '<div class="value tabular">' + (score.totals.paternal.brca1 + score.totals.paternal.brca2) + "</div>" +
        "</div>" +
      "</div>" +
      '<p class="faint">' + T("results.side_note") + "</p>" +

      consanguinityNote +
      genomicFileNote(state.genomicFile, lang) +

      '<div class="note-box">' + Icon("info-circle") + "<span>" + T("results.limitation_note") + "</span></div>" +

      renderAction(isHigh, alreadyReferred, referral, uiState, lang) +

      '<div class="btn-row between" style="margin-top:0.5rem;">' +
        '<button class="btn btn-text" data-action="go-stage" data-stage="2">' + T("results.edit_tree") + "</button>" +
        '<button class="btn btn-ghost" data-action="restart">' + T("results.restart") + "</button>" +
      "</div>"
    );
  }

  function referredCard(referral, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const pathway = referral.pathwayAssigned ? Data.pathwayById(referral.pathwayAssigned) : null;
    return (
      '<div class="panel">' +
        '<h3 style="margin-bottom:0.5rem;display:flex;align-items:center;gap:0.45rem;">' + Icon("check-circle") + " " + T("results.referred_title") + "</h3>" +
        '<p class="subtle" style="margin-bottom:1rem;">' + T("results.referred_id") + ' <b class="tabular">' + referral.id + "</b>" +
          (pathway ? " · " + T("results.referred_pathway") + " <b>" + Data.pathwayLabel(pathway, lang) + "</b>" : "") +
        "</p>" +
        global.JuthoorTracker.render(referral.status, lang) +
        '<p class="faint" style="margin-top:1rem;">' + T("results.referred_note") + "</p>" +

        '<div class="btn-row" style="margin-top:1.1rem;">' +
          '<button class="btn btn-outline" data-action="open-report">' + Icon("printer") + " " + T("results.open_report") + "</button>" +
          '<button class="btn btn-primary" data-action="open-invite">' + Icon("users") + " " + T("results.open_invite") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function renderAction(isHigh, alreadyReferred, referral, uiState, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    if (isHigh) {
      if (alreadyReferred) {
        return referredCard(referral, lang);
      }
      return (
        '<div class="panel">' +
          '<h3 class="block-title" style="margin-bottom:0.35rem;">' + T("results.next_step_title") + "</h3>" +
          '<p class="faint" style="margin-bottom:1rem;">' + T("results.next_step_desc") + "</p>" +
          pathwayCards(uiState.preferredPathway, "select-pathway", lang) +
          '<div class="btn-row" style="margin-top:1.1rem;">' +
            '<button class="btn btn-primary" data-action="request-referral">' + Icon("route") + " " + T("results.request_referral") + "</button>" +
          "</div>" +
        "</div>"
      );
    }
    return (
      '<div class="panel-flat">' +
        '<span class="tag" style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.7rem;font-weight:700;padding:0.22rem 0.65rem;border-radius:999px;margin-bottom:0.6rem;background:var(--imaging-bg);color:var(--imaging);">' + Icon("hospital") + " " + T("results.imaging_pathway_tag") + "</span>" +
        '<h3 style="margin-bottom:0.4rem;">' + T("results.imaging_reco_title") + "</h3>" +
        '<p class="subtle">' + T("results.imaging_reco_desc") + "</p>" +
      "</div>"
    );
  }

  global.JuthoorResults = { render: render, pathwayCards: pathwayCards, referredCard: referredCard };
})(window);
