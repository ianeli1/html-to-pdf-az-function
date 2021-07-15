import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as multipart from "parse-multipart";
import { create as createPdf } from "html-pdf";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<Buffer> {
  context.log("HTTP trigger function processed a request.");
  context.log("JavaScript HTTP trigger function processed a request.");
  // encode body to base64 string
  const bodyBuffer = Buffer.from(req.body);
  // get boundary for multipart data e.g. ------WebKitFormBoundaryDtbT5UpPj83kllfw
  const boundary = multipart.getBoundary(req.headers["content-type"]);
  // parse the body
  const parts = multipart.Parse(bodyBuffer, boundary);

  //grab the file
  const file = parts[0].data as Buffer;

  //turn it into a string
  const html: string = file.toString("ascii");

  //promise waits until process is done
  return new Promise<Buffer>((res) => {
      //create pdf
    createPdf(html).toBuffer((_err, buffer) => {
        //callback returns pdf with the correct headers
      context.res = {
        body: buffer,
        headers: {
          "Content-Type": "application/pdf",
          "content-disposition": "attachment; filename=output.pdf",
        },
      };
      //end promise
      res(buffer);
    });
  });
};

export default httpTrigger;
