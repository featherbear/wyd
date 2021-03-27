import ICSManager from "../../components/ICS";

export async function get(req, res, next) {
  let data = await ICSManager.data;

  // Strip sensitive data
  data = data.map(({ dtstart, dtend }) => ({
    dtstart,
    dtend,
  }));

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data, null, 4));
}
