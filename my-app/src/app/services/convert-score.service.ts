import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';import { Exam } from '../exam';import { ExamService } from './exam.service';import 'rxjs/add/operator/map';@Injectable()export class ConvertScoreService {  private totalHours: number = 0;  private academicStanding: string = '';  private displayResults = false;  private exceptionArr: string[] = []  constructor(  private http: Http,  private _exam: ExamService) { }  public separateData() {    this._exam.examArr.forEach(exam => {      this.http.get(this.getRequestURL(exam)).map(res => res).subscribe(res => {        var data = JSON.parse(res['_body']);        if (this.exceptionArr.includes(exam.getName())) {          this.parseExceptionData(exam, data);        } else {          this.parseData(exam, data);        }      });    });    if (this._exam.examArr.every(exam => exam.getTranslatedHours() != null)) {      if (this._exam.examArr.every(exam => exam.getTranslatedCourse() != null)) {        this.checkDuplicateCourseExists();      }    }  }  public getRequestURL(exam: Exam): string {    switch(exam.getType()) {      case 'AP':        this.exceptionArr = [];        this.exceptionArr = ["Chemistry", "Chinese", "Japanese", "Music Theory"];        return '../assets/data/ap.json';      case 'IB-High':        this.exceptionArr = [];        this.exceptionArr = ["Biology"];        return '../assets/data/ib-high.json';      case 'IB-Standard':        this.exceptionArr = [];        return '../assets/data/ib-standard.json';      case 'SAT':        this.exceptionArr = [];        this.exceptionArr = ["Chemistry"];        return '../assets/data/sat.json';    }    return null;  }  public parseData(exam, data) {    if (data[exam.getName()]['scores'].includes(parseInt(exam.getScore()))) {      exam.setTranslatedCourse(data[exam.getName()]['course']);      exam.setTranslatedHours(data[exam.getName()]['hours']);    } else {      exam.setTranslatedCourse('SCORE DOES NOT TRANSLATE');      exam.setTranslatedHours(0);    }  }  public parseExceptionData(exam, data) {    if (exam.getScore() < data[exam.getName()]['scores'][0]) {      exam.setTranslatedCourse('SCORE DOES NOT TRANSLATE');      exam.setTranslatedHours(0);    } else {      while(!data[exam.getName()]['scores'].includes(parseInt(exam.getScore()))) {        exam.setName(exam.getName() + "+");      }      exam.setTranslatedCourse(data[exam.getName()]['course']);      exam.setTranslatedHours(data[exam.getName()]['hours']);    }  }  public checkDuplicateCourseExists() {    for (var i = 0; i < this._exam.examArr.length - 1; i++) {      for (var j = i+1; j < this._exam.examArr.length; j++) {        if (this._exam.examArr[i].getTranslatedCourse() == this._exam.examArr[j].getTranslatedCourse()) {          if (this._exam.examArr[i].getTranslatedCourse() != "SCORE DOES NOT TRANSLATE") {            this._exam.examArr[j].setTranslatedCourse("DUPLICATE COURSE (" + this._exam.examArr[j].getTranslatedCourse() + ")");            this._exam.examArr[j].setTranslatedHours(0);            this._exam.examArr[j].setDuplicateCourseExists(true);          }        }      }    }    this.checkEdgeCases();  }  public checkEdgeCases() {    var MATH1551: boolean = false;    var MATH1551and1552: boolean = false;    var BIOL1510: boolean = false;    var BIOL1510and1520: boolean = false;    var PHYS2211: boolean = false;    var PHYS2212: boolean = false;    var PHYS2211and2212: boolean = false;    for (var i = 0; i < this._exam.examArr.length; i++) {      switch(this._exam.examArr[i].getTranslatedCourse()) {        case "MATH 1551":          MATH1551 = true;          var index1 = i;          break;        case "MATH 1551 & MATH 1552":          MATH1551and1552 = true;          break;        case "BIOL 1510":          BIOL1510 = true;          var index2 = i;          break;        case "BIOL 1510 & BIOL 1520":          BIOL1510and1520 = true;          break;        case "PHYS 2211":          PHYS2211 = true;          var index3 = i;          break;        case "PHYS 2212":          PHYS2212 = true;          var index4 = i;          break;        case "PHYS 2211 & PHYS 2212":          PHYS2211and2212 = true;          break;      }      if (MATH1551 && MATH1551and1552) {        this._exam.examArr[index1].setTranslatedCourse("DUPLICATE COURSE (" + this._exam.examArr[index1].getTranslatedCourse() + ")");        this._exam.examArr[index1].setTranslatedHours(0);        this._exam.examArr[index1].setDuplicateCourseExists(true);      } if (BIOL1510 && BIOL1510and1520) {        this._exam.examArr[index2].setTranslatedCourse("DUPLICATE COURSE (" + this._exam.examArr[index2].getTranslatedCourse() + ")");        this._exam.examArr[index2].setTranslatedHours(0);        this._exam.examArr[index2].setDuplicateCourseExists(true);      } if (PHYS2211 && PHYS2211and2212) {        this._exam.examArr[index3].setTranslatedCourse("DUPLICATE COURSE (" + this._exam.examArr[index3].getTranslatedCourse() + ")");        this._exam.examArr[index3].setTranslatedHours(0);        this._exam.examArr[index3].setDuplicateCourseExists(true);      } if (PHYS2212 && PHYS2211and2212) {        this._exam.examArr[index4].setTranslatedCourse("DUPLICATE COURSE (" + this._exam.examArr[index4].getTranslatedCourse() + ")");        this._exam.examArr[index4].setTranslatedHours(0);        this._exam.examArr[index4].setDuplicateCourseExists(true);      }    }    this.calculateTotalHours();  }  public calculateTotalHours() {    this._exam.examArr.forEach (exam => {      this.totalHours = this.totalHours + exam.getTranslatedHours();    });    this.calculateAcademicStanding();  }  public calculateAcademicStanding() {    if (this.totalHours > 89) {      this.academicStanding = "SENIOR";    } else if (this.totalHours > 59) {      this.academicStanding = "JUNIOR";    } else if (this.totalHours > 29) {      this.academicStanding = "SOPHOMORE";    } else {      this.academicStanding = "FRESHMAN";    }    this.displayResults = true;  }  public setTotalHours(totalHours: number) {    this.totalHours = totalHours;  }  public setAcademicStanding(academicStanding: string) {    this.academicStanding = academicStanding;  }  public setDisplayResults(displayResults: boolean) {    this.displayResults = displayResults;  }}
