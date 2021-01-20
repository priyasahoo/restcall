import { Injectable, NgZone } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { JSDATA_RESOURCE_CONFIGS } from "../../appconfiguration";
import { DaolayerService } from "../daolayer/daolayer.service";
import { ApplicationNameService } from "../../services/applicationNameConfig/applicationNameConfig.service";
import { SendMail } from "../../classes/sendMail" 
@Injectable()
export class EmailService {
  public AppName: any;
  private basePath: string;
  private emailEndPoint: string;
  private emailServiceUrl: string;
  public emailMessage: any;

  constructor(
    private daolayer: DaolayerService,
    private zoneService: NgZone,
    private AppNameService: ApplicationNameService
  ) {
    this.basePath = JSDATA_RESOURCE_CONFIGS.EmailReport.basePath;
    this.emailEndPoint = JSDATA_RESOURCE_CONFIGS.EmailReport.endpoint;
    this.emailServiceUrl = this.basePath + this.emailEndPoint;
    this.AppName = this.AppNameService.ApplicatioName;
  }
  // Service the send mail
  sendEmail(sub: string, content: string): Promise<any> {
    const params = {
      uid: "smadmin",
      subject: sub,
      bodyContent: content,
      filename: "GSM_CDR_17-3-2017-15-14-43.pdf"
    };

    return this.daolayer
      ._get({ params }, this.emailServiceUrl)
      .then(response => {
        console.log("Response is:", response);
        // const records = response.json();
        try {
          // return JSON.parse(records[0]);
        } catch (e) {
          // return records[0];
        }
      });
  }

  // function to send the email without any attachment, this is currently used for LIC
  sendEmailWithoutAttachment(objExtraParams): Promise<any> {
    this.zoneService.runOutsideAngular(() => {
      (<any>document.querySelector("#pageLoading")).classList.add("show");
      (<any>document.querySelector("#pageLoading")).classList.remove("hide");
    });
    objExtraParams = objExtraParams || {};
    let postBody = {};
    const allPromise = [];
    const sendMail = objExtraParams.sendMail ? SendMail.True: SendMail.False;
    const emailId = objExtraParams.emailId || "";
    const subject = objExtraParams.subject || "";
    const bodyContent = objExtraParams.bodyContent || "";
    const requestId = new Date().valueOf();
    const promis = new Promise((resolve, reject) => {
      postBody = {
        multipart: "false",
        noend: "false",
        gridData: "false",
        sendMail: sendMail,
        emailId: emailId,
        subject: subject,
        bodyContent: bodyContent,
        isPasswordProtected: "false",
        password: "",
        tempfileName: "",
        headerContent: this.AppName.appName,
        userId: "smadmin",
        filename: "",
        sendMailWithoutAttachment: "true",
        requestId: String(requestId)
      };
      this.daolayer
        ._post(postBody, undefined, "../service/PdfConversionMapping")
        .then(result => {
          resolve(result);
        });
    });
    return promis;
  }

  // validating emails
  validateEmailAddress(value) {
    //  const regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    /* Updated Regex for Email validation
     *  Accepted valid email patterns: samplename@domain.com, samplename@domain.co.in,
     *   samplename@domain.subdomain.com, samplename@domain.subdomain.co.in
     */
    if (value != undefined || value != null) {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //  const result = value.replace(/\s/g, "").split(/,|;/);
      const result = value.split(/,|;/);
      for (let i = 0; i < result.length; i++) {
        if (!regex.test(result[i])) {
          return false;
        }
      }
    }
    return true;
  }
}
