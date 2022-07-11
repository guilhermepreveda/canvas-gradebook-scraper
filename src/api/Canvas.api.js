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
      // console.log("3. Creating the AppError template");
      const error = new AppError(
        "Something went wrong when retrieving the gradebook",
        400
      );

      // console.log("4. Setting up a timeout before start the request (10sec)");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // console.log("5. Setting up a timeout for the request (5sec)");
      const timer = setTimeout(async () => {
        reject(error);
      }, 5000);

      // console.log(
      //   "6. GET request (NODE-FETCH) on Canvas url with custom headers"
      // );

      await fetch(
        `${canvasUrl}/users/${user_id}/files/${attachment_id}?download=1&amp`, //?download=1&amp
        {
          headers: headers,
        }
      )
        .then((response) => {
          // console.log("7. Converting response to text");
          return response.text();
        })
        .then((response) => {
          // console.log(
          //   "8. Clearing the time and resolving the Promise with response"
          // );

          if (response.includes("<!DOCTYPE html>")) {
            throw Error;
          }

          clearTimeout(timer);

          resolve(response);
        })
        .catch((err) => {
          return reject(() => {
            // console.log("> An error occurred, timer cleared and promise rejected");
            clearTimeout(timer);

            reject(error);
          });
        });
    });
  }
}
