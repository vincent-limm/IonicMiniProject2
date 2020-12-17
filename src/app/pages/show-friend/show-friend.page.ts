import { Component, OnInit, ViewChild } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import {
  AlertController,
  IonSearchbar,
  LoadingController,
  NavController,
  ToastController,
} from "@ionic/angular";
import { AuthService } from "src/app/service/auth.service";
import { UserService } from "src/app/service/user.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-show-friend",
  templateUrl: "./show-friend.page.html",
  styleUrls: ["./show-friend.page.scss"],
})
export class ShowFriendPage implements OnInit {
  userEmail: string;
  userID: string;
  photo: SafeResourceUrl;
  user: any;
  user2: any;
  userName: string;
  userAll: any;
  friends: any;
  public searchTerm: string = "";

  @ViewChild("mySearchbar") searchbar: IonSearchbar;

  constructor(
    private navCtrl: NavController,
    private authSrv: AuthService,
    private userSrv: UserService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}
  ionViewWillEnter() {
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
              this.userName = this.user[0].nDepan;
              this.userSrv
                .getFriend("" + this.userName)
                .snapshotChanges()
                .pipe(
                  map((changes) =>
                    changes.map((c) => ({
                      key: c.payload.key,
                      ...c.payload.val(),
                    }))
                  )
                )
                .subscribe((data2) => {
                  this.user2 = data2;
                  this.userAll = data2;
                });
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

  async presentAlert(value) {
    const alert = await this.alertCtrl.create({
      header: "Are you sure?",
      message: "You have to re-add your friend if you do this.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          handler: () => this.DeleteFriend(value),
        },
      ],
    });
    await alert.present();
  }

  async presentToast() {
    let toast = this.toastCtrl.create({
      message: "Deleted",
      color: "primary",
      duration: 1000,
      position: "bottom",
    });

    (await toast).present();
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: "Deleting",
      duration: 5000,
    });
    await loading.present();

    await loading.onDidDismiss();
  }

  DeleteFriend(value) {
    this.presentLoading().then(() => {
      this.user2 = this.userAll;
      this.userSrv.deleteFriend(value.key, this.userName).then((res) => {
        this.user2 = this.user2.filter((User4) => {
          return User4.email !== value.email;
        });
        this.userAll = this.user2;
        this.presentToast();
        this.searchbar.ionClear;
      });
    });
  }

  setFilteredItems() {
    this.user2 = this.userAll;
    this.user2 = this.userSrv.filterItems(this.searchTerm, this.user2);
  }
}
