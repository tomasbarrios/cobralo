function relativeDays(timestamp: number) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const aDay = 1000 * 60 * 60 * 24;
  const diffInDays = Math.round((timestamp - Date.now()) / aDay);
  return rtf.format(diffInDays, 'day');
}

console.log(relativeDays(Date.now() - 86400000)); // "yesterday"
console.log(relativeDays(Date.now())); // "today"
console.log(relativeDays(Date.now() + 86400000)); // "tomorrow"
console.log(relativeDays(Date.now() - 8640000000)); // "100 days ago"
console.log(relativeDays(Date.now() + 8640000000)); // "in 100 days"

// Note my timestamp argument is a number in ms, if you want to pass in a Date object, modify the function accordingly

export function formatDate(date: Date) {
  
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
    const dateFormat = new Intl.DateTimeFormat("es-CL", options);
    const usedOptions = dateFormat.resolvedOptions();
  
    // console.log({ calendar: usedOptions.calendar });
    // // "chinese"
  
    // console.log({ numberingSystem: usedOptions.numberingSystem });
    // // "arab"
    // if(ago) {
    //   console.log(date.getTime())
    //   return relativeDays(date.getTime())
    // }
  
    console.log({ timeZone: usedOptions.timeZone });
  
    return dateFormat.format(date);
  }
  