(function () {
  "use strict";

  var impactData = [
    {
      id: "scientific",
      title: "Scientific and academic impact",
      themes: "Harmonisation · Reproducibility · Comparability",
      summary: "We align data and methods to produce transparent, reproducible, and comparable multinational evidence.",
      detail: "IMPRESIVE uses harmonised definitions, a common data model, shared protocols, and common analytical programmes across participating countries. This reduces avoidable differences in study implementation, improves transparency and reproducibility, and enables meaningful comparison of results across populations and healthcare systems."
    },
    {
      id: "clinical",
      title: "Clinical, policy, and societal impact",
      themes: "Timeliness · Transportability · Evidence equity",
      summary: "We generate timely and privacy-preserving evidence for clinical, regulatory, and policy decisions.",
      detail: "IMPRESIVE combines multinational data with clinical expertise to accelerate evidence generation for drug safety and healthcare decisions. Its distributed approach keeps patient-level data within each country, while cross-country analyses assess whether findings are transportable across healthcare settings and improve evidence representation for Asian and other underrepresented populations."
    },
    {
      id: "economic",
      title: "Economic, industry, and technological innovation impact",
      themes: "Cost reduction · Reuse · Innovation readiness",
      summary: "We reuse data and analytical infrastructure to reduce research costs and support scalable innovation.",
      detail: "IMPRESIVE reuses validated data structures, cohorts, quality checks, and analytical programmes across studies and countries. Although initial infrastructure requires investment, reuse reduces duplicated work, shortens study timelines, and lowers the cost of subsequent research. The structured environment can also support trial feasibility assessment, external model validation, and future data-driven innovation."
    },
    {
      id: "education",
      title: "Education and global development impact",
      themes: "Capacity building · Participation · Sustainability",
      summary: "We build shared skills and standards so more countries can participate in multinational research.",
      detail: "IMPRESIVE converts its experience in data mapping, validation, and analysis into shared guidance and training for researchers, clinicians, data personnel, and regulators. This creates a common research language, lowers barriers for emerging partners, and enables participating countries to contribute not only data but also to study design, analysis, and interpretation."
    }
  ].map(Object.freeze);

  window.IMPRESIVE_IMPACT_DATA = Object.freeze(impactData);
})();
