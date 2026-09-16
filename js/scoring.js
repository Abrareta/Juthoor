/**
 * scoring.js — محرك حساب Manchester Scoring System
 *
 * منهجية الحساب:
 * 1) لكل قريبة مصابة، تُحسب نقاطها من جدول Manchester حسب نوع الإصابة والعمر وقت التشخيص.
 * 2) تُجمع النقاط على مستوى كل خط عائلي على حدة (أمومي / أبوي) — الأم والخالة والجدة لأم على الخط
 *    الأمومي، العمة والجدة لأب على الخط الأبوي. الأخت تُضاف لكلا الخطين لأنها تتشارك الوالدين مع
 *    المستخدمة ولا تحدد بمفردها أي خط بعينه.
 * 3) يُؤخذ الخط الأعلى نتيجة فقط (مو جمع الخطين) — هذا هو أساس منهجية Manchester الرسمية.
 * 4) الإحالة تُوصى بها إذا: المجموع المُجمّع للخط الأعلى ≥ 15، أو نتيجة جين واحد (BRCA1 أو BRCA2
 *    منفردًا) ≥ 10 — طبقًا لمعايير NHS الموثّقة.
 *
 * هذا الملف لا يعالج التعديلات النسيجية الخاصة بورم المريضة نفسها (pathology-adjusted modifiers)
 * لأنها تخص خصائص ورم مشخّص لدى المريضة نفسها، وهذا خارج نطاق الطبقة الأولى من البروتوتايب
 * (تقييم الخطورة بناءً على تاريخ الأقارب فقط).
 */
(function (global) {
  "use strict";

  const Data = global.JuthoorData;

  function pointsFor(relative) {
    const table = Data.MANCHESTER_POINTS[relative.cancerType];
    if (!table) return { brca1: 0, brca2: 0 };
    const band = table[relative.ageBand];
    return band ? { brca1: band.brca1, brca2: band.brca2 } : { brca1: 0, brca2: 0 };
  }

  /**
   * @param {Array} relatives - كل عنصر: {id, relationId, side, cancerType, ageBand, consanguinity}
   * @returns {Object} تفاصيل الحساب الكاملة
   */
  function computeScore(relatives) {
    const totals = {
      maternal: { brca1: 0, brca2: 0 },
      paternal: { brca1: 0, brca2: 0 },
    };

    const breakdown = (relatives || []).map(function (r) {
      const pts = pointsFor(r);
      const sides = r.side === "both" ? ["maternal", "paternal"] : [r.side];
      sides.forEach(function (side) {
        totals[side].brca1 += pts.brca1;
        totals[side].brca2 += pts.brca2;
      });
      return Object.assign({}, r, { points: pts, appliesToSides: sides });
    });

    const combinedMaternal = totals.maternal.brca1 + totals.maternal.brca2;
    const combinedPaternal = totals.paternal.brca1 + totals.paternal.brca2;
    const usedSide = combinedPaternal > combinedMaternal ? "paternal" : "maternal";
    const usedTotals = totals[usedSide];
    const combined = Math.max(combinedMaternal, combinedPaternal);
    const singleGeneMax = Math.max(usedTotals.brca1, usedTotals.brca2);

    const meetsCombined = combined >= Data.THRESHOLDS.combined;
    const meetsSingleGene = singleGeneMax >= Data.THRESHOLDS.singleGene;
    const isHighRisk = meetsCombined || meetsSingleGene;

    const anyConsanguinity = (relatives || []).some(function (r) { return !!r.consanguinity; });

    return {
      totals: totals,
      usedSide: usedSide,
      combined: combined,
      singleGeneMax: singleGeneMax,
      meetsCombined: meetsCombined,
      meetsSingleGene: meetsSingleGene,
      isHighRisk: isHighRisk,
      band: isHighRisk ? "high" : "normal",
      anyConsanguinity: anyConsanguinity,
      breakdown: breakdown,
      relativeCount: (relatives || []).length,
    };
  }

  global.JuthoorScoring = { computeScore: computeScore, pointsFor: pointsFor };
})(window);
