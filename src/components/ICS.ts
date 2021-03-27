import IcalExpander from "ical-expander";
import fetch from "node-fetch";

/**
 * Parse a single IcalExpander component to an ICAL Object
 *
 * @param component
 * @returns ICAL Object
 */
function mapper(component) {
  if (component[0] === "vevent") {
    let obj = component[1].reduce(
      (obj, v) => ({
        ...obj,

        // Combine repeated properties as an array
        [v[0]]: obj[v[0]]
          ? [...(Array.isArray(obj[v[0]]) ? obj[v[0]] : []), v[3]]
          : v[3],
      }),
      {}
    );

    delete obj["rrule"];
    delete obj["exdate"];
    delete obj["created"];
    delete obj["last-modified"];
    delete obj["sequence"];
    delete obj["dtstamp"]; // This is just the current data

    // obj['dtstart'] = new Date(obj['dtstart']) // Convert to JS Date
    // obj['dtend'] = new Date(obj['dtend']) // Convert to JS Date
    return obj;
  }

  return "?";
}

/**
 * Parse ICS string
 *
 * @param ics
 * @returns
 */
function doTheParse(ics) {
  let forwardTime = new Date();

  const calendar = new IcalExpander({ ics, maxIterations: 20 });

  let occurrences = calendar.after(forwardTime).occurrences.map(
    ({
      startDate: { _cachedUnixTime: startDate },
      endDate: { _cachedUnixTime: endDate },
      item: {
        component: { jCal: component },
      },
    }) => {
      let result = mapper(component);
      result.dtstart = new Date(
        startDate ? startDate * 1000 : `${result.dtstart}T00:00`
      );
      result.dtend = new Date(
        endDate ? endDate * 1000 : `${result.dtend}T00:00`
      );
      return result;
    }
  );

  // dedupe
  let dedupe = [
    ...new Set(occurrences.map((o: object) => JSON.stringify(o))),
  ].map((j: string) => JSON.parse(j));

  // return dedupe;

  // Double check forward
  let after = dedupe.filter((e) => new Date(e.dtstart) >= forwardTime);

  return after;
  // return calendar
  // .after(new Date())
  // .events.map(({ component: { jCal: component } }) => mapper(component))
}

export default new (class {
  #cache: any;
  #urls: string[];

  #isInit: boolean = false;

  constructor() {
    this.#isInit = false;
    this.#cache = null;
    this.#urls = [];
  }

  init(urls) {
    if (this.#isInit) throw new Error("Already initialised");
    this.#urls = urls;
    this.#cache = this.update();
    this.#isInit = true;
  }

  get data() {
    if (!this.#isInit) throw new Error("Not initialised");
    return this.#cache;
  }

  private async update() {
    this.#cache = (
      await Promise.all(
        this.#urls.map(async (url) =>
          doTheParse(await fetch(url).then((r) => r.text()))
        )
      )
    ).flat();

    setTimeout(
      () => this.update(), // Update
      10 * 60 * 1000 // 10 min loop
    );

    return this.#cache;
  }
})();
