validateEmailId() {
    this.isEmailValid = this.emailService.validateEmailAddress(
      this.licEmailField.nativeElement.value
    );
    if (this.isEmailValid) {
      this.emailErrorMessageTmpl.hide();
    } else {
      this.emailErrorMessageTmpl.show();
      // this.licEmailField.nativeElement.focus();
    }
  }

  // function to validate all the lic form fields.
  validateAllFields() {
    this.validateEmailId();
    if (!this.licFormObj["subject"] || this.licFormObj["subject"] === "") {
      this.licSubjectField.nativeElement.focus();
    } else if (
      !this.licFormObj["emailIds"] ||
      this.licFormObj["emailIds"] === "" ||
      !this.isEmailValid
    ) {
      this.licEmailField.nativeElement.focus();
    } else if (
      !this.licMessageTempl ||
      this.licMessageTempl.nativeElement.textContent === ""
    ) {
      this.licMessageTempl.nativeElement.focus();
    }
  }

  // Function to call email service
  sendLicEmail() {
    this.submitAttempt = true;
    let bodyContent = "";
    let responseMessage = "";
    let licResponseMessageType = MessageType.successMsg;
    const isInValidValue =
      this.licFormObj["subject"] === undefined ||
      this.licFormObj["emailIds"] === undefined ||
      this.licMessageTempl === undefined ||
      this.licFormObj["subject"] === "" ||
      this.licFormObj["emailIds"] === "" ||
      this.licMessageTempl.nativeElement.textContent === "";
    if (isInValidValue) {
      this.InvalidFields = true;
    } else {
      this.InvalidFields = false;
    }
    if (
      this.isEmailValid &&
      this.licFormObj["emailIds"].length > 0 &&
      !this.InvalidFields
    ) {
      if (this.isStaticDashboardShared) {
        let splitDashboardURL = this.shareDashboardUrl.split('?');
        bodyContent = this.licMessageTempl.nativeElement.innerText.replace(
          this.dashboard.title,
          " <a href=" +
             splitDashboardURL[0] + '?' + encodeURI(splitDashboardURL[1]) +
            ">" +
            this.dashboard.title +
            "</a> "
        );
      } else {
        bodyContent = this.licMessageTempl.nativeElement.innerText;
      }
      bodyContent = bodyContent.split("\n").join("<br>");
      const emailParams = {
        emailId: this.licFormObj["emailIds"],
        subject: this.licFormObj["subject"],
        bodyContent: bodyContent
      };
      this.emailService
        .sendEmailWithoutAttachment(emailParams)
        .then(response => {
          this.closeShareDashPopOver(null);
          this.zoneService.runOutsideAngular(() => {
            (<any>document.querySelector("#pageLoading")).classList.add("hide");
            (<any>document.querySelector("#pageLoading")).classList.remove(
              "show"
            );
          });
          var message = response.error.text;
          switch (message) {
            case "EMAIL_SENT":
              responseMessage = "Email is sent.";
              licResponseMessageType = MessageType.successMsg;
              const themesavedMsg = this.i18nDirective.getTranslatedValue(
                "emailSent",
                responseMessage
              );
              const confMessage: ConfGlobalMessage = {
                message: themesavedMsg,
                messagePopupUId: "lic_response",
                messageType: licResponseMessageType,
                autoClose: true
              };
              this.commonUtility.showGlobalMessagePopup(confMessage);
              break;

            case "SMTP_RELAY_ERROR":
              this.smtpRelay = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;

            case "SMTP_PORT_ERROR":
              this.smtpPort = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;

            case "EMAIL_SENDER_ERROR":
              this.senderEmail = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;

            default:
              this.emailNotSent = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;
          }
          this.kebabMenuDropdown.nativeElement.removeAttribute("aria-haspopup");
          this.zoneService.runOutsideAngular(() => {
            document.getElementById("okEmailButtonDash").focus();
          });
        });
    }
  }
