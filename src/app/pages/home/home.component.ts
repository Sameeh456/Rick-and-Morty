import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchUrl = 'https://rickandmortyapi.com/api/character';
  queryParams: any = {};
  searchForm: FormGroup;
  responseData: any;
  autoFillArray: string[] = [];
  
  constructor(
    private apiService: ApiService,
    private router: Router, 
    private fb: FormBuilder,) { }
  

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      name: [""],
    });
  }

  onSearch() {
    if(this.searchForm.valid) {
      this.queryParams.name = this.searchForm.get('name').value
      this.router.navigate(['/results'], {queryParams: this.queryParams})
    }
  }

  onKey(e) {
    this.queryParams.name = e.srcElement.value
    let checkString = e.srcElement.value
    this.apiService.getResponseFromUrl(this.searchUrl, this.queryParams).subscribe(res => {
      if(this.queryParams.name == checkString) {
        this.setAutoFillArray(res['results'])
      }
    }, (error) => {
      console.log(error);
      if(this.queryParams.name == checkString) {
        this.autoFillArray = []
      }
    })
  }

  setAutoFillArray(data) {
    this.autoFillArray = []
    if(this.queryParams.name.length > 0) {
      let i = 0;
      while (this.autoFillArray.length < 5 && i < data.length) {
        if(!this.autoFillArray.includes(data[i]?.name)) {
          this.autoFillArray.push(data[i].name)
        } 
        i++
      }
    }
  }

  onAutoFillClick(item) {
    this.queryParams.name = item
    this.router.navigate(['/results'], {queryParams: this.queryParams})
  }

}
