/**
 * dashboard.js — لوحة الطبيب: دعم قرار سريري + تتبع الإحالة (من طرف الطبيب)
 * دخول محدود الصلاحيات: رمز وصول تجريبي وهمي (ليس آلية أمان حقيقية) لمحاكاة تقييد الدخول عن المريضات.
 */
(function (global) {
  "use strict";

  const Data = global.JuthoorData;
  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function renderGate(errorMsg, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    return (
      '<div class="panel gate-card">' +
        '<span class="eyebrow">' + T("dashboard.gate_eyebrow") + "</span>" +
        '<h2 style="margin:0.5rem 0 0.6rem;">' + T("dashboard.gate_title") + "</h2>" +
        '<p class="subtle" style="margin-bottom:1.2rem;">' + T("dashboard.gate_subtitle") + "</p>" +
        '<div class="field" style="margin-bottom:1rem;text-align:start;">' +
          "<label>" + T("dashboard.gate_code_label") + "</label>" +
          '<input type="text" id="physician-code" maxlength="4" placeholder="••••" />' +
        "</div>" +
        (errorMsg ? '<p class="faint" style="color:var(--risk-high);margin-bottom:0.75rem;">' + errorMsg + "</p>" : "") +
        '<button class="btn btn-primary" data-action="submit-physician-code" style="width:100%;">' + T("dashboard.gate_submit") + "</button>" +
        '<details style="margin-top:1rem;text-align:start;">' +
          '<summary class="faint" style="cursor:pointer;">' + T("dashboard.gate_hint_summary") + "</summary>" +
          '<p class="faint" style="margin-top:0.4rem;">' + I18n.t(lang, "dashboard.gate_hint_body", { code: Data.MOCK_PHYSICIAN_ACCESS_CODE }) + "</p>" +
        "</details>" +
      "</div>"
    );
  }

  function doctorSelect(referral, lang) {
    const options = Data.MOCK_DOCTORS.map(function (d) {
      const sel = d.id === referral.doctorId ? "selected" : "";
      return '<option value="' + d.id + '" ' + sel + ">" + Data.doctorName(d, lang) + " — " + Data.doctorSpecialty(d, lang) + "</option>";
    }).join("");
    return (
      '<div class="field">' +
        "<label>" + I18n.t(lang, "dashboard.doctor_label") + "</label>" +
        '<select data-field="doctorId" data-id="' + referral.id + '"><option value="">' + I18n.t(lang, "dashboard.doctor_unassigned") + "</option>" + options + "</select>" +
      "</div>"
    );
  }

  function sideShortLabel(side, lang) {
    if (side === "both") return I18n.t(lang, "common.side_both");
    if (side === "maternal") return I18n.t(lang, "common.side_maternal");
    return I18n.t(lang, "common.side_paternal");
  }

  function relativesSummary(snapshot, lang) {
    if (!snapshot.length) return '<p class="faint">' + I18n.t(lang, "dashboard.no_history") + "</p>";
    return (
      '<div class="reason-list">' +
      snapshot
        .map(function (r) {
          const relation = Data.relationById(r.relationId);
          return (
            '<div class="reason-row"><span>' + Data.relationLabel(relation, lang) + " — " + Data.cancerLabel(r.cancerType, lang) + " (" + Data.ageLabel(r.cancerType, r.ageBand, lang) + ")</span><span class=\"faint\">" + sideShortLabel(relation.side, lang) + "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function statusStepClass(status) {
    const idx = Data.REFERRAL_STATUSES.indexOf(status);
    return "s" + idx;
  }

  function nextActionLabel(idx, lang) {
    if (idx === 0) return I18n.t(lang, "dashboard.next_review");
    if (idx === 1) return I18n.t(lang, "dashboard.next_transfer");
    if (idx === 2) return I18n.t(lang, "dashboard.next_brca_ready");
    return null;
  }

  function pathwayAssignCards(referral, lang) {
    return (
      '<div class="pathway-grid">' +
      Data.REFERRAL_PATHWAYS
        .map(function (p) {
          const selected = p.id === referral.pathwayAssigned ? "selected" : "";
          const suggested = !referral.pathwayAssigned && p.id === referral.pathwayPreferred;
          return (
            '<div class="pathway-card ' + selected + '" data-action="assign-pathway" data-id="' + referral.id + '" data-pathway="' + p.id + '">' +
              '<div class="pathway-icon">' + Icon(p.icon) + "</div>" +
              "<h4>" + Data.pathwayLabel(p, lang) + (suggested ? ' <span class="degree-badge">' + I18n.t(lang, "dashboard.pathway_suggested") + "</span>" : "") + "</h4>" +
              "<p>" + Data.pathwayDescription(p, lang) + "</p>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function patientSummaryItem(referral, isOpen, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const score = referral.score;
    const label = referral.anonymous ? T("dashboard.anonymous_case") : T("dashboard.identified_case");
    const idx = Data.REFERRAL_STATUSES.indexOf(referral.status);
    const nextLabel = nextActionLabel(idx, lang);
    const atPathwayStep = idx === 1;
    const canAdvance = !atPathwayStep || !!referral.pathwayAssigned;

    return (
      '<div class="patient-summary ' + (isOpen ? "open" : "") + '" data-referral-id="' + referral.id + '">' +
        '<div class="patient-summary-top" data-action="toggle-referral" data-id="' + referral.id + '">' +
          "<div>" +
            '<div class="patient-id tabular">' + referral.id + "</div>" +
            '<div class="faint">' + label + " · " + score.relativeCount + " " + T("dashboard.relatives_count") + "</div>" +
          "</div>" +
          '<div style="display:flex;align-items:center;gap:0.5rem;">' +
            '<span class="risk-chip ' + score.band + '">' + (score.band === "high" ? T("dashboard.risk_high") : T("dashboard.risk_low")) + "</span>" +
            '<span class="status-pill ' + statusStepClass(referral.status) + '">' + Data.statusLabel(referral.status, lang) + "</span>" +
          "</div>" +
        "</div>" +

        '<div class="patient-detail">' +
          '<h3 class="block-title" style="font-size:0.92rem;">' + T("dashboard.summary_title") + "</h3>" +
          '<p class="faint">' + I18n.t(lang, "dashboard.summary_line", { side: sideShortLabel(score.usedSide, lang), combined: score.combined, single: score.singleGeneMax }) + "</p>" +
          relativesSummary(referral.relativesSnapshot, lang) +
          (referral.genomicFileSnapshot ? '<p class="faint">' + Icon("file-check") + " " + I18n.t(lang, "dashboard.genomic_attached", { name: referral.genomicFileSnapshot.name }) + "</p>" : "") +

          '<h3 class="block-title" style="font-size:0.9rem;">' + T("dashboard.live_status_title") + "</h3>" +
          global.JuthoorTracker.render(referral.status, lang) +

          doctorSelect(referral, lang) +

          (atPathwayStep
            ? '<div><h3 class="block-title" style="font-size:0.88rem;margin-bottom:0.5rem;">' + T("dashboard.assign_title") + "</h3>" + pathwayAssignCards(referral, lang) + "</div>"
            : "") +

          (nextLabel
            ? '<div class="btn-row">' +
                '<button class="btn btn-primary" data-action="advance-referral" data-id="' + referral.id + '" ' + (canAdvance ? "" : "disabled") + ">" + nextLabel + "</button>" +
                (atPathwayStep && !canAdvance ? '<span class="faint" style="align-self:center;">' + T("dashboard.pick_pathway_first") + "</span>" : "") +
              "</div>"
            : '<p class="faint" style="color:var(--risk-low);display:flex;align-items:center;gap:0.35rem;">' + Icon("check-circle") + " " + T("dashboard.completed") + "</p>") +
        "</div>" +
      "</div>"
    );
  }

  function renderDashboard(state) {
    const lang = state.lang;
    const T = function (key) { return I18n.t(lang, key); };
    const referrals = state.referrals.slice().reverse();
    const list = referrals.length
      ? '<div style="display:flex;flex-direction:column;gap:0.9rem;">' + referrals.map(function (r) { return patientSummaryItem(r, r.id === state.activeReferralId, lang); }).join("") + "</div>"
      : '<div class="empty-state panel-flat">' + T("dashboard.empty_state") + "</div>";

    return (
      '<div class="section-head">' +
        '<span class="eyebrow">' + T("dashboard.list_eyebrow") + "</span>" +
        "<h2>" + T("dashboard.list_title") + "</h2>" +
        '<p class="subtle">' + T("dashboard.list_subtitle") + "</p>" +
      "</div>" +
      list
    );
  }

  function render(state, gateError) {
    if (!state.physicianUnlocked) return renderGate(gateError, state.lang);
    return renderDashboard(state);
  }

  global.JuthoorDashboard = { render: render };
})(window);
