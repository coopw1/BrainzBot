module.exports = function stringToUnicode(inputString) {
  const regexPatterns = [
    [/(?<=[^\p{L}\d]|^)"(.+?)"(?=[^\p{L}\d]|$)/gu, "\u201c$1\u201d"],
    [/(?<=\W|^)'(n)'(?=\W|$)/gi, "\u2019$1\u2019"],
    [/(?<=[^\p{L}\d]|^)'(.+?)'(?=[^\p{L}\d]|$)/gu, "\u2018$1\u2019"],
    [/(\d+)"/g, "$1\u2033"],
    [/(\d+)'(\d+)/g, "$1\u2032$2"],
    [/'/g, "\u2019"],
    [/(?<!\.)\.{3}(?!\.)/g, "\u2026"],
    [/ - /g, " \u2013 "],
    [
      /\d{4}-\d{2}(?:-\d{2})?(?=\W|$)/g,
      (e) => (Number.isNaN(Date.parse(e)) ? e : e.replaceAll("-", "\u2010")),
    ],
    [/\d+(-\d+){2,}/g, (e) => e.replaceAll("-", "\u2012")],
    [/(\d+)-(\d+)/g, "$1\u2013$2"],
    [/(?<=\S)-(?=\S)/g, "\u2010"],
  ];

  const replacePatterns = [
    [/\[(.+?)(\|.+?)?\]/g, (e, t, a = "") => `[${btoa(t)}${a}]`],
    [/(?<=\/\/)(\S+)/g, (e, t) => btoa(t)],
    [/'''/g, "<b>"],
    [/''/g, "<i>"],
    ...regexPatterns,
    [/<b>/g, "'''"],
    [/<i>/g, "''"],
    [/(?<=\/\/)([A-Za-z0-9+/=]+)/g, (e, t) => atob(t)],
    [/\[([A-Za-z0-9+/=]+)(\|.+?)?\]/g, (e, t, a = "") => `[${atob(t)}${a}]`],
  ];

  function modifyStringWithPatterns(input, patterns) {
    let modifiedString = input;
    patterns.forEach(([regex, replacement]) => {
      modifiedString = modifiedString.replace(regex, replacement);
    });
    return modifiedString;
  }

  const modifiedString = modifyStringWithPatterns(inputString, regexPatterns);
  return modifyStringWithPatterns(modifiedString, replacePatterns);
};
