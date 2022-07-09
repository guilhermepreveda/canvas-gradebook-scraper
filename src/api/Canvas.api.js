import axios from "axios";

import AppError from "../errors/AppError.js";
import { canvasUrl } from "../config.js";

const canvas = axios.create({
  baseURL: `${canvasUrl}`,
  withCredentials: true,
});

const canvasApiV1 = axios.create({
  baseURL: `${canvasUrl}/api/v1`,
  withCredentials: true,
});

export default class CanvasApi {
  static async getUserId(_normandy_session) {
    return await canvasApiV1
      .request({
        url: "/users/self",
        method: "get",
        headers: { Cookie: `_normandy_session=${_normandy_session}` },
      })
      .then((response) => response.data.id)
      .catch((err) => {
        throw new AppError("Something went wrong with the login attempt", 400);
      });
  }

  static async getGradebook(_normandy_session, user_id, attachment_id) {
    const headers = {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      cookie: `_normandy_session=${_normandy_session.value}`,
    };

    return await new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        await fetch(
          `${canvasUrl}/users/${user_id}/files/${attachment_id}?download=1&amp`,
          {
            headers: headers,
          }
        )
          .then((response) => response.text())
          .then((response) => resolve(response))
          .catch((err) =>
            reject(() => {
              throw new AppError(
                "Something went wrong with the gradebook retrieving",
                400
              );
            })
          );
      }, 10000);
    });
  }
}
