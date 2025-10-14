import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-add-app',
  templateUrl: './add-app.component.html',
  styleUrls: ['./add-app.component.scss']
})
export class AddAppComponent implements OnInit {
  addAppForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.addAppForm = this.fb.group({
      appName: ['', Validators.required],
      appCode: ['', Validators.required]
    });
  }

  addApp() {
    if (this.addAppForm.invalid) {
      this.toast.show('Fill both fields', 'danger');
      return;
    }

    const { appName, appCode } = this.addAppForm.value;
    this.ussd.addApp({ name: appName, code: appCode }).subscribe({
      next:(res)=>{
        console.log(res);
      }
    });
    this.toast.show('App added successfully!', 'success');
    this.addAppForm.reset();
  }
}