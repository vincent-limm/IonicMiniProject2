import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Capacitor,
} from "@capacitor/core";
import { NavController, Platform } from "@ionic/angular";
import { AuthService } from "../service/auth.service";
import { UserService } from "../service/user.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
})
export class RegisterPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";

  validation_messages = {
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Enter a valid email." },
    ],
    password: [
      { type: "required", message: "Password is required." },
      {
        type: "minlength",
        message: "Password must be at least 6 characters long.",
      },
    ],
    nDepan: [{ type: "required", message: "Nama Depan is required." }],
    nBelakang: [{ type: "required", message: "Nama Belakang is required." }],
  };

  @ViewChild("filePicker", { static: false })
  filePickerRef: ElementRef<HTMLInputElement>;
  photo: SafeResourceUrl =
    "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png";
  isDesktop: boolean;
  contact: number;
  add: number;
  dataUrl: any;
  constructor(
    private navCtrol: NavController,
    private authSrv: AuthService,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private userSrv: UserService,
    private router: Router,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
        ])
      ),
      password: new FormControl(
        "",
        Validators.compose([Validators.minLength(5), Validators.required])
      ),
      nDepan: new FormControl("", Validators.compose([Validators.required])),
      nBelakang: new FormControl("", Validators.compose([Validators.required])),
    });
    if (
      (this.platform.is("mobile") && this.platform.is("hybrid")) ||
      this.platform.is("desktop")
    ) {
      this.isDesktop = true;
    }
  }

  async getPicture(type: string) {
    if (
      !Capacitor.isPluginAvailable("Camera") ||
      (this.isDesktop && type === "gallery")
    ) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    const image = await Camera.getPhoto({
      quality: 100,
      width: 400,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
    });

    this.dataUrl = image.dataUrl;
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.dataUrl
    );
  }

  onFileChoose(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
      console.log("File Format not supported");
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }

  tryRegister(value) {
    this.authSrv.registerUser(value).then(
      (res) => {
        this.errorMessage = "";
        this.successMessage = "Your account has been created. Please Log in";
      },
      (err) => {
        console.log(err);
        this.errorMessage = err.message;
        this.successMessage = "";
      }
    );
    value.password = null;
    this.upload(value.nDepan);
    this.userSrv
      .createUser(value, this.dataUrl)
      .then((res) => {
        this.router.navigateByUrl("/login");
      })
      .catch((error) => console.log(error));
  }

  dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  upload(nDepan: string) {
    const file = this.dataURLtoFile(this.dataUrl, "file");
    const filePath = "photos/" + nDepan + ".jpg";
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
  }

  goLoginPage() {
    this.navCtrol.navigateBack("");
  }
}
