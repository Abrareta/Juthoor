/**
 * landing.js — الصفحة الرئيسية (المرحلة 0): الانطباع الأول عن جذور
 */
(function (global) {
  "use strict";

  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  // رسم بصري عضوي لشجرة عائلة مجرّدة — عُقد وخطوط متفرّعة، بلا أي رمز طبي أو نباتي حرفي
  function familyVisual() {
    return (
      '<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke-linecap="round" fill="none">' +
          '<path d="M200 330 V255" stroke="var(--ink-faint)" stroke-width="2"/>' +
          '<path d="M200 255 C 200 210, 130 205, 110 150" stroke="var(--burgundy)" stroke-width="1.6" opacity="0.75"/>' +
          '<path d="M200 255 C 200 210, 270 205, 290 150" stroke="var(--olive)" stroke-width="1.6" opacity="0.75"/>' +
          '<path d="M110 150 C 95 110, 60 100, 55 60" stroke="var(--burgundy)" stroke-width="1.3" opacity="0.6"/>' +
          '<path d="M110 150 C 120 110, 150 100, 150 60" stroke="var(--burgundy)" stroke-width="1.3" opacity="0.6"/>' +
          '<path d="M290 150 C 275 110, 250 100, 250 60" stroke="var(--olive)" stroke-width="1.3" opacity="0.6"/>' +
          '<path d="M290 150 C 305 110, 340 100, 345 60" stroke="var(--olive)" stroke-width="1.3" opacity="0.6"/>' +
          '<path d="M200 255 C 160 275, 140 290, 120 330" stroke="var(--taupe)" stroke-width="1.6" opacity="0.7"/>' +
          '<path d="M200 255 C 240 275, 260 290, 280 330" stroke="var(--taupe)" stroke-width="1.6" opacity="0.7"/>' +
        "</g>" +
        '<circle cx="200" cy="340" r="9" fill="var(--ink)"/>' +
        '<circle cx="120" cy="335" r="5.5" fill="var(--taupe)"/>' +
        '<circle cx="280" cy="335" r="5.5" fill="var(--taupe)"/>' +
        '<circle cx="110" cy="150" r="6.5" fill="var(--burgundy)"/>' +
        '<circle cx="290" cy="150" r="6.5" fill="var(--olive)"/>' +
        '<circle cx="55" cy="55" r="5" fill="var(--burgundy)" opacity="0.8"/>' +
        '<circle cx="150" cy="55" r="5" fill="var(--burgundy)" opacity="0.8"/>' +
        '<circle cx="250" cy="55" r="5" fill="var(--olive)" opacity="0.8"/>' +
        '<circle cx="345" cy="55" r="5" fill="var(--olive)" opacity="0.8"/>' +
      "</svg>"
    );
  }

  function statRow(lang) {
    const T = function (key) { return I18n.t(lang, key); };
    return (
      '<div class="landing-stats">' +
        '<div class="stat"><strong>' + T("landing.stat1_value") + "</strong><span>" + T("landing.stat1_label") + "</span></div>" +
        '<div class="stat"><strong>' + T("landing.stat2_value") + "</strong><span>" + T("landing.stat2_label") + "</span></div>" +
        '<div class="stat"><strong>' + T("landing.stat3_value") + "</strong><span>" + T("landing.stat3_label") + "</span></div>" +
      "</div>"
    );
  }

  function howItWorks(lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const steps = [
      { icon: "branch", title: T("landing.step1_title"), desc: T("landing.step1_desc") },
      { icon: "sparkle", title: T("landing.step2_title"), desc: T("landing.step2_desc") },
      { icon: "route", title: T("landing.step3_title"), desc: T("landing.step3_desc") },
    ];
    return (
      '<section id="landing-how" class="panel">' +
        '<div class="section-head" style="margin-bottom:1.4rem;">' +
          '<span class="eyebrow">' + T("landing.how_eyebrow") + "</span>" +
          "<h3 class=\"block-title\" style=\"font-size:1.25rem;\">" + T("landing.how_title") + "</h3>" +
        "</div>" +
        '<div class="grid-3">' +
        steps
          .map(function (s, i) {
            return (
              '<div style="display:flex;flex-direction:column;gap:0.6rem;">' +
                '<div class="tree-node-avatar" style="background:var(--burgundy);width:38px;height:38px;">' + Icon(s.icon) + "</div>" +
                '<strong style="font-size:0.94rem;">' + (i + 1) + ". " + s.title + "</strong>" +
                '<span class="faint">' + s.desc + "</span>" +
              "</div>"
            );
          })
          .join("") +
        "</div>" +
      "</section>"
    );
  }

  function render(state) {
    const lang = state.lang;
    const T = function (key) { return I18n.t(lang, key); };
    return (
      '<div class="landing">' +
        '<div class="landing-copy">' +
          '<span class="landing-label"><span class="dot"></span>' + T("landing.brand_label") + "</span>" +
          "<h1>" + T("landing.headline_pre") + "<em>" + T("landing.headline_em") + "</em>.</h1>" +
          '<p class="landing-sub">' + T("landing.sub") + "</p>" +
          '<div class="landing-ctas">' +
            '<button class="btn btn-primary btn-lg" data-action="start-assessment">' + T("landing.cta_primary") + " " + Icon("chevron-start") + "</button>" +
            '<button class="btn btn-outline btn-lg" data-action="scroll-how">' + T("landing.cta_secondary") + "</button>" +
          "</div>" +
          statRow(lang) +
        "</div>" +
        '<div class="landing-visual">' + familyVisual() + "</div>" +
      "</div>" +

      '<div style="height:0.5rem"></div>' +
      howItWorks(lang) +

      '<div class="distinction-row" style="margin-top:0.5rem;">' +
        '<div class="distinction-col imaging">' +
          '<span class="tag">' + Icon("hospital") + " " + I18n.t(lang, "common.imaging_tag") + "</span>" +
          "<strong>" + T("landing.dist_imaging_title") + "</strong>" +
          '<span class="desc">' + T("landing.dist_imaging_desc") + "</span>" +
        "</div>" +
        '<div class="distinction-col genetic">' +
          '<span class="tag">' + Icon("dna") + " " + I18n.t(lang, "common.genetic_tag") + "</span>" +
          "<strong>" + T("landing.dist_genetic_title") + "</strong>" +
          '<span class="desc">' + T("landing.dist_genetic_desc") + "</span>" +
        "</div>" +
      "</div>"
    );
  }

  global.JuthoorLanding = { render: render };
})(window);
