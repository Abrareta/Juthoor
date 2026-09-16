/**
 * invite.js — مولّد دعوة القريبات لتقييم مماثل (Cascade Screening)
 * ملاحظة: الرابط تجريبي بالكامل لأغراض العرض — لا يوجد نظام دعوات فعلي خلف الكواليس بهذا البروتوتايب.
 */
(function (global) {
  "use strict";

  const Icon = global.JuthoorIcons.icon;
  const I18n = global.JuthoorI18n;

  function inviteCode(referralId) {
    return (referralId || "JTH").replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  }

  function inviteMessage(link, lang) {
    return I18n.t(lang, "invite.message", { link: link });
  }

  function build(referral, lang) {
    const T = function (key) { return I18n.t(lang, key); };
    const code = inviteCode(referral.id);
    const link = "https://juthoor.app/invite/" + code;
    const message = inviteMessage(link, lang);

    return (
      '<div class="modal-sheet">' +
        '<div class="modal-head">' +
          "<div>" +
            '<span class="eyebrow">' + T("invite.eyebrow") + "</span>" +
            "<h2>" + T("invite.title") + "</h2>" +
          "</div>" +
          '<button class="modal-close" data-action="close-modal" aria-label="Close">' + Icon("x") + "</button>" +
        "</div>" +

        '<p class="subtle" style="margin-bottom:0.9rem;">' + T("invite.subtitle") + "</p>" +

        '<div class="invite-panel">' +
          '<div class="invite-link-row"><code>' + link + "</code>" +
            '<button class="btn btn-ghost" data-action="copy-invite-link" data-link="' + link + '" style="padding:0.4rem 0.7rem;">' + Icon("copy") + "</button>" +
          "</div>" +
          '<div class="invite-message">' + message.replace(/\n/g, "<br/>") + "</div>" +
          '<div class="btn-row">' +
            '<button class="btn btn-primary" data-action="copy-invite-message" data-message="' + encodeURIComponent(message) + '">' + Icon("copy") + " " + T("invite.copy_message") + "</button>" +
          "</div>" +
        "</div>" +

        '<p class="faint" style="margin-top:0.9rem;">' + T("invite.disclaimer") + "</p>" +

        '<div class="btn-row end" style="margin-top:1rem;">' +
          '<button class="btn btn-ghost" data-action="close-modal">' + T("invite.done") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  global.JuthoorInvite = { build: build };
})(window);
