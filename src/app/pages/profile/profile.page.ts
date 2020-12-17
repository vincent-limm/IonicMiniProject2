import { Component, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { SafeResourceUrl } from "@angular/platform-browser";
import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from "@ionic/angular";
import { map } from "rxjs/operators";
import { AuthService } from "src/app/service/auth.service";
import { UserService } from "src/app/service/user.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  userEmail: string;
  userID: string;
  namaDepan: string;
  namaBelakang: string;
  photo: SafeResourceUrl;
  user: any;
  myFeed: any;
  constructor(
    private navCtrl: NavController,
    private authSrv: AuthService,
    private userSrv: UserService,
    private storage: AngularFireStorage,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.authSrv.userDetails().subscribe(
      (res) => {
        if (res !== null) {
          this.userEmail = res.email;
          this.userSrv
            .getAll("user")
            .snapshotChanges()
            .pipe(
              map((changes) =>
                changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
              )
            )
            .subscribe((data) => {
              this.user = data;
              this.user = this.user.filter((User) => {
                return User.email == this.userEmail;
              });
              this.photo = this.user[0].imageUrl;
              this.namaDepan = this.user[0].nDepan;
              this.namaBelakang = this.user[0].nBelakang;
              this.showFeed(this.namaDepan);
            });
        } else {
          this.navCtrl.navigateBack("");
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  showFeed(nDepan: string) {
    this.userSrv
      .getCurrentLocation("" + nDepan)
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe((data) => {
        this.myFeed = data;
      });
  }
  deleteFeed(key: string) {
    this.userSrv.DeleteLocation(key, this.namaDepan).then((res) => {});
    this.presentToastDelete();
  }

  async presentToast() {
    let toast = this.toastCtrl.create({
      message: "Uploaded",
      color: "primary",
      duration: 1000,
      position: "bottom",
    });

    (await toast).present();
  }
  async presentToastDelete() {
    let toast = this.toastCtrl.create({
      message: "Deleted",
      color: "primary",
      duration: 1000,
      position: "bottom",
    });

    (await toast).present();
  }

  async presentToast2() {
    let toast = this.toastCtrl.create({
      message: "Logged Out",
      color: "primary",
      duration: 1000,
      position: "bottom",
    });

    (await toast).present();
  }

  async presentLoading2() {
    const loading = await this.loadingCtrl.create({
      message: "Exiting....",
      duration: 5000,
    });
    await loading.present();

    await loading.onDidDismiss();
  }

  logout() {
    this.presentLoading2().then(() => {
      this.authSrv
        .logoutUser()
        .then((res) => {
          this.presentToast2;
          this.navCtrl.navigateBack("");
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}
