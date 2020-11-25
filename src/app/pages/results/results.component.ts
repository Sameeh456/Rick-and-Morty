import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  searchUrl = 'https://rickandmortyapi.com/api/character';
  subPages: number[] =  [1, 2, 3, 4];
  displayIndexes: number[] = [0,1,2,3,4];
  activeIndex: number = 1
  responseInfo;
  responseData;
  statusFilterOpen: boolean = false;
  genderFilterOpen: boolean = false;
  statusFilter: string[] = ['Alive','Dead','Unknown'];
  genderFilter: string[] = ['Male', 'Female','Genderless', 'Unknown'];
  queryParams: any;
  searchForm: FormGroup;
  moreDetailsOpen: number;
  moreDetailsItem: any;
  isLoading:boolean;
  autoFillArray: string[] = [];

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService, 
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    ) {
   }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      name: [""],
    });
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = {...queryParams};
      this.queryParams.name && this.searchForm.get('name').setValue(this.queryParams.name)
      this.getApiResponse(this.searchUrl, this.queryParams)
    })
  }

  //  Search Section Part
  onSearch() {
    if(this.searchForm.valid) {
      this.queryParams = {
        name: this.searchForm.get('name').value
      }
      this.autoFillArray = []
      document.getElementById('input').blur()
      this.filterFunction()
    }
  }
  onGenderFilter(item) {
    this.queryParams['gender'] = item
    this.filterFunction()
    this.genderFilterOpen = false
  }
  onStatusFilter(item) {
    this.queryParams['status'] = item
    this.filterFunction()
    this.statusFilterOpen = false
  }
  onFilterReset() {
    delete this.queryParams['status']
    delete this.queryParams['gender']
    this.statusFilterOpen = false
    this.genderFilterOpen = false
    this.filterFunction()
  }
  filterFunction() {
    this.getApiResponse(this.searchUrl, this.queryParams)
    let url=''
    if(!!this.queryParams['name']) {
      url = 'name=' + this.queryParams['name']
    }
    if(!!this.queryParams['gender']) {
      url.includes('name=') ? url = url + '&' : url
      url = url + 'gender=' + this.queryParams['gender']
    }
    if(!!this.queryParams['status']) {
      url.includes('name=') || url.includes('gender=') ? url = url + '&' : url
      url = url + 'status=' + this.queryParams['status']
    }
    url = '/results?'+ url;
    this.location.go(url)
  }

  // Pagination Part
  getPaginationNumbers() {
    let pageNumber
    if(this.responseInfo.next != null) {
      let pageString = this.responseInfo.next.match('page=[0-9]{1,5}')[0]
      let nextPageNumber = pageString.match('[0-9]{1,5}')[0]
      pageNumber= parseInt(nextPageNumber) - 1;
    } else if(this.responseInfo.prev != null) {
      let pageString = this.responseInfo.prev.match('page=[0-9]{1,5}')[0]
      let prevPageNumber = pageString.match('[0-9]{1,5}')[0]
      pageNumber= parseInt(prevPageNumber) + 1;
    } else if(this.responseInfo.pages == 1) {
      pageNumber= 1;
    }
    this.subPages = []
    for(let i=1; i<=Math.ceil(this.responseData.length / 5); i++) {
      this.subPages.push((pageNumber-1)*4 + i)
    }
    this.activeIndex = this.subPages[0]
    this.displayIndexes = [0,1,2,3,4];
  }
  onPaginationIndexClick(i) {
    let increaseFactor = this.subPages.indexOf(i)*5;
    this.displayIndexes = [increaseFactor + 0, increaseFactor + 1, increaseFactor + 2, increaseFactor + 3, increaseFactor + 4,]
    this.activeIndex = i
  }
  onPreviousClick() {
    if(this.responseInfo.prev != null) {
      this.getApiResponse(this.responseInfo.prev)
    }
  }
  onNextClick() {
    if(this.responseInfo.next != null) {
      this.getApiResponse(this.responseInfo.next)
    }
  }


  // Modal Part
  onMoreDetails(item) {
    this.moreDetailsItem = item
    document.getElementById("displayDetailsModalButton").click();
  }

  //Api Data Fetch
  getApiResponse(url, queryParams = {}) {
    this.apiService.getResponseFromUrl(url, queryParams).subscribe(res => {
      this.responseData = res['results']
      this.responseInfo = res['info']
      this.getPaginationNumbers()
    }, (error) => {
      this.responseData = null
      this.responseInfo = null
      console.log(error);
    })
  }

  // Autofill Part
  onKey(e) {
    this.queryParams.name = e.srcElement.value
    let checkString = e.srcElement.value
    this.apiService.getResponseFromUrl(this.searchUrl, this.queryParams).subscribe(res => {
      if(this.queryParams.name == checkString) {
        this.setAutoFillArray(res['results'])
      }
    }, (error) => {
      if(this.queryParams.name == checkString) {
        this.autoFillArray = []
      }
      console.log(error);
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
    this.queryParams = { name : item }
    this.autoFillArray = []
    this.searchForm.get('name').setValue(this.queryParams.name)
    this.filterFunction()
  }

  
}
