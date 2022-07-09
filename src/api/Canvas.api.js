import axios from "axios";
import fetch from "node-fetch";

import AppError from "../errors/AppError.js";
import { canvasUrl } from "../config.js";

// console.log("* Creating a axios instance");
const canvasApiV1 = axios.create({
  baseURL: `${canvasUrl}/api/v1`,
  withCredentials: true,
});

export default class CanvasApi {
  static async getUserId(_normandy_session) {
    // console.log("==== CanvasApi.getUserId(_normandy_session) ==========");

    // console.log("1. GET request (AXIOS) on Canvas API endpoint with _normandy_session cookie");
    return await canvasApiV1
      .request({
        url: "/users/self",
        method: "get",
        headers: { Cookie: `_normandy_session=${_normandy_session}` },
      })
      .then((response) => {
        // console.log("2. Selecting and returing the user id from response.data");
        return response.data.id;
      })
      .catch((err) => {
        // console.log("> An error has occurred");
        throw new AppError("Something went wrong with the login attempt", 400);
      });
  }

  static async getGradebook(_normandy_session, user_id, attachment_id) {
    // console.log("==== CanvasApi.getGradebook(_normandy_session, user_id, attachment_id) ==========");

    // console.log("1. Creating headers, with _normandy_session cookie, for the request");

    const headers = {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      cookie: `_normandy_session=${_normandy_session.value}`,
    };

    // console.log("2. Creating new Promise");
    return await new Promise(async (resolve, reject) => {
      // console.log("3. Setting up a timeout for the request (10sec)");
      setTimeout(async () => {
        // console.log("4. GET request (NODE-FETCH) on Canvas url with custom headers");
        await fetch(
          `${canvasUrl}/users/${user_id}/files/${attachment_id}?download=1&amp`,
          {
            headers: headers,
          }
        )
          .then((response) => {
            // console.log("5. Converting response to text");
            return response.text();
          })
          .then((response) => {
            // console.log("5. Resolving the Promise with response");

            return resolve(response);
          })
          .catch((err) => {
            return reject(() => {
              // console.log("> An error occurred, Promise rejected");

              throw new AppError(
                "Something went wrong with the gradebook retrieving",
                400
              );
            });
          });
      }, 10000);
    });
  }
}
