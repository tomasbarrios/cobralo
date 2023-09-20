export function showDate(date: Date) {
    // https://stackoverflow.com/questions/66590691/typescript-type-string-is-not-assignable-to-type-numeric-2-digit-in-d
  
    let options = {
      // weekday: "long",
      // year: "numeric", // not addingthis will result in
      // month: "long",
      // day: "numeric",
      timeZone: "America/Santiago",
      // timeZoneName: "short",
    };
    // let options2 = {};
    // const defaultOptions = {
    //   ...options,
    //   ...options2,
    // };
    const dateFormat = new Intl.DateTimeFormat(undefined, options);
    const usedOptions = dateFormat.resolvedOptions();
  
    // console.log({ calendar: usedOptions.calendar });
    // // "chinese"
  
    // console.log({ numberingSystem: usedOptions.numberingSystem });
    // // "arab"
  
    console.log({ timeZone: usedOptions.timeZone });
  
    return dateFormat.format(date);
  }
  