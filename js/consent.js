/**
 * consent.js — المرحلة 1: الدخول المباشر والموافقة الصريحة
 */
(function (global) {
  "use strict";

  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function toggleRow(id, checked, title, desc, extraAttrs) {
    return (
      '<label class="toggle-row" id="' + id + '-row" for="' + id + '">' +
        '<span class="toggle-switch ' + (checked ? "on" : "") + '">' +
          '<input type="checkbox" id="' + id + '" ' + (extraAttrs || "") + (checked ? "checked" : "") + " />" +
          '<span class="knob"></span>' +
        "</span>" +
        "<span>" +
          "<strong>" + title + "</strong>" +
          '<span class="desc">' + desc + "</span>" +
        "</span>" +
      "</label>"
    );
  }

  function nafathCard(verified, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    if (verified) {
      return (
        '<div class="panel-flat" style="margin-bottom:1rem;display:flex;align-items:center;gap:0.6rem;">' +
          Icon("check-circle") +
          "<strong>" + T("consent.nafath_verified") + "</strong>" +
        "</div>"
      );
    }
    return (
      '<div class="panel-flat" style="margin-bottom:1rem;">' +
        '<div style="display:flex;align-items:flex-start;gap:0.6rem;">' +
          Icon("shield") +
          "<span>" +
            "<strong>" + T("consent.nafath_title") + "</strong>" +
            '<span class="desc" style="display:block;margin-top:0.2rem;">' + T("consent.nafath_desc") + "</span>" +
          "</span>" +
        "</div>" +
        '<div class="btn-row" style="margin-top:0.75rem;">' +
          '<button class="btn btn-outline" data-action="verify-nafath">' + T("consent.nafath_cta") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function render(state) {
    const consent = state.consent;
    const lang = state.lang;
    const T = function (key) { return I18n.t(lang, key); };
    return (
      nafathCard(state.nafathVerified, lang) +

      '<div class="section-head">' +
        '<span class="eyebrow">' + T("consent.eyebrow") + "</span>" +
        "<h2>" + T("consent.title") + "</h2>" +
        '<p class="subtle">' + T("consent.subtitle") + "</p>" +
        '<p class="faint">' + T("consent.eligibility_note") + "</p>" +
      "</div>" +

      '<div class="distinction-row">' +
        '<div class="distinction-col imaging">' +
          '<span class="tag">' + Icon("hospital") + " " + I18n.t(lang, "common.imaging_tag") + "</span>" +
          "<strong>" + T("consent.dist_imaging_title") + "</strong>" +
          '<span class="desc">' + T("consent.dist_imaging_desc") + "</span>" +
        "</div>" +
        '<div class="distinction-col genetic">' +
          '<span class="tag">' + Icon("dna") + " " + I18n.t(lang, "common.genetic_tag") + "</span>" +
          "<strong>" + T("consent.dist_genetic_title") + "</strong>" +
          '<span class="desc">' + T("consent.dist_genetic_desc") + "</span>" +
        "</div>" +
      "</div>" +

      '<div class="panel-flat">' +
        toggleRow("consent-anonymous", consent.anonymous, T("consent.toggle_anon_title"), T("consent.toggle_anon_desc")) +
        toggleRow("consent-agree", consent.agreed, T("consent.toggle_agree_title"), T("consent.toggle_agree_desc")) +
      "</div>" +

      (consent.agreed
        ? ""
        : '<p class="faint">' + T("consent.agree_hint") + "</p>") +

      '<div class="btn-row end">' +
        '<button class="btn btn-primary btn-lg" data-action="start-tree">' +
          T("consent.cta") + " " + Icon("chevron-start") +
        "</button>" +
      "</div>"
    );
  }

  global.JuthoorConsent = { render: render };
})(window);
