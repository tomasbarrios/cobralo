export function formatNumber(number: number) {
    // https://stackoverflow.com/questions/66590691/typescript-type-string-is-not-assignable-to-type-numeric-2-digit-in-d
  
    // let options = {
    //   // weekday: "long",
    //   // year: "numeric", // not addingthis will result in
    //   // month: "long",
    //   // day: "numeric",
    //   timeZone: "America/Santiago",
    //   // timeZoneName: "short",
    // };
    // let options2 = {};
    // const defaultOptions = {
    //   ...options,
    //   ...options2,
    // };
    const numberFormat = new Intl.NumberFormat("es-CL", { style: 'currency', currency: 'CLP' });
    // const usedOptions = numberFormat.resolvedOptions();
  
    // console.log({ calendar: usedOptions.calendar });
    // // "chinese"
  
    // console.log({ numberingSystem: usedOptions.numberingSystem });
    // // "arab"
  
    // console.log({ timeZone: usedOptions.timeZone });
  
    return numberFormat.format(number);
  }
  