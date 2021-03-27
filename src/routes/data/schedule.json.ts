import ICSManager from "../../components/ICS";

export async function get(req, res, next) {
  let data = (await ICSManager.data).flat();

  // Strip sensitive data
  let cleaned = data.map(({ dtstart, dtend }) => ({
    dtstart,
    dtend,
  }));

  let sorted = cleaned.sort(
    ({ dtstart: a }, { dtstart: b }) =>
      new Date(a).getTime() - new Date(b).getTime()
  );

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(sorted, null, 4));
}
