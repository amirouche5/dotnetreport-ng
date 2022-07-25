import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, InjectionToken, Injector, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
//import { appModuleAnimation } from '@shared/animations/routerTransition';
//import { this.AppConsts } from '@shared/this.AppConsts';
//import { AppComponentBase } from '@shared/common/app-component-base';
//import { API_BASE_URL } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { BASE_URL_TOKEN } from './amar_lib.di';

 

declare var ko: any;
declare var reportViewModel: any;
declare var $: any;

 

@Component({
  selector: 'app-dot-net-report',
  templateUrl: './dot-net-report.component.html',
  styleUrls: ['./dot-net-report.component.css'],
  //  animations: [appModuleAnimation()]
})

export class DotNetReportComponent  implements OnInit, OnDestroy {


    public exportExcelUrl: string;
    //private baseUrl: string = URL ;

        // -- added 
        public containerClass: string = '';  
 
        private AppConsts = {
          remoteServiceBaseUrl : this.baseUrl
        }
    
        // -- end added 

    public filterInnerTemplate: SafeHtml;
    public reportFilterTemplate: SafeHtml;
    public filterGroupTemplate: SafeHtml;
    public pagerTemplate: SafeHtml;
    public adminModeTemplate: SafeHtml;
    public manageAccessTemplate: SafeHtml;
    public flyFiltersTemplate: SafeHtml;
    public reportScheduleTemplate: SafeHtml;
    public reportTemplate: SafeHtml;

    constructor(injector: Injector,
        private sanitizer: DomSanitizer,
        private cdref: ChangeDetectorRef,
        private http: HttpClient, 
        @Inject(BASE_URL_TOKEN) private baseUrl: string) {
        // super(injector);
        this.baseUrl = baseUrl ? baseUrl : "";
        console.log('AMAR LIB BASE URL : ' + this.baseUrl);
    }

    ngOnInit() {

        this.exportExcelUrl = this.AppConsts.remoteServiceBaseUrl + '/Report/DownloadExcel';
        // this.spinnerService.show();

        let url_ = this.baseUrl + "/api/ReportApi/GetUsersAndRoles";
        url_ = url_.replace(/[?&]$/, "");

        this.http.get(url_).pipe(finalize(() => {
           // this.spinnerService.hide();
        })).subscribe((response: any) => {

            let result = response['result'];
            let vm = new reportViewModel({
                runReportUrl: this.AppConsts.remoteServiceBaseUrl + '/Report/Report',
                reportWizard: $("#modal-reportbuilder"),
                lookupListUrl: this.AppConsts.remoteServiceBaseUrl + '/api/ReportApi/GetLookupList',
                apiUrl: this.AppConsts.remoteServiceBaseUrl + '/api/ReportApi/CallReportApi',
                runReportApiUrl: this.AppConsts.remoteServiceBaseUrl + '/api/ReportApi/RunReportApi',
                getUsersAndRolesUrl: this.AppConsts.remoteServiceBaseUrl + '/api/ReportApi/GetUsersAndRoles',
                userSettings: result,
                execReportUrl: this.AppConsts.remoteServiceBaseUrl + '/api/ReportApi/RunReport',
                samePageOnRun: true
            });

            vm.printReport = function () {
                var printWindow = window.open("");
                printWindow?.document.open();
                printWindow?.document.write('<html><head>' +
                    '<link href="/app/main/theme.css" rel="stylesheet" />' +
                    '<style type="text/css">a[href]:after {content: none !important;}</style>' +
                    '</head><body>' + $('.report-inner').html() +
                    '</body></html>');

                setTimeout(function () {
                    printWindow?.print();
                    printWindow?.close();
                }, 250);
            }

            vm.downloadExcel = function () {
                $("#downloadExcel").submit();
            }

            vm.init(0, result.noAccount);

            this.renderKOTemplates();
            ko.applyBindings(vm, document.getElementById('dot-net-reports'));

            this.bindWindowResize(vm);
        });
    }

    ngOnDestroy() {
        ko.cleanNode(document.getElementById('dot-net-reports'));
    }

    private renderKOTemplates() {

        this.reportTemplate = this.sanitizer.bypassSecurityTrustHtml(` <script type="text/html" id="report-template">
                <div class="report-chart" data-bind="attr: {id: 'chart_div_' + $parent.ReportID()}, visible: $parent.isChart"></div>

                <div class="table-responsive" data-bind="with: ReportData">
                    <table class="table table-hover table-condensed">
                        <thead>
                            <tr class="no-highlight">
                                <!-- ko if: $parentContext.$parent.canDrilldown() && !IsDrillDown() -->
                                <th></th>
                                <!-- /ko -->
                                <!-- ko foreach: Columns -->
                                <th data-bind="attr: { id: 'col' + $index() }">
                                    <a href="" data-bind="click: function(){ $parentContext.$parentContext.$parent.changeSort(SqlField); }">
                                        <span data-bind="text: ColumnName"></span>
                                        <span data-bind="text: $parentContext.$parentContext.$parent.pager.sortColumn() === SqlField ? ($parentContext.$parentContext.$parent.pager.sortDescending() ? '&#9660;' : '&#9650;') : ''">
                                        </span>
                                    </a>
                                </th>
                                <!-- /ko -->
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="display: none;" data-bind="visible: Rows.length < 1">
                                <td class="text-info" data-bind="attr:{colspan: Columns.length}">
                                    No records found
                                </td>
                            </tr>
                            <!-- ko foreach: Rows  -->
                            <tr>
                                <!-- ko if: $parentContext.$parentContext.$parent.canDrilldown() && !$parent.IsDrillDown() -->
                                <td><a href="#" data-bind="click: function(){ toggle(); }"><span class="fa" data-bind="css: {'fa-plus': !isExpanded(), 'fa-minus': isExpanded()}"></span></a></td>
                                <!-- /ko -->
                                <!-- ko foreach: Items -->
                                <td data-bind="html: FormattedValue"></td>
                                <!-- /ko -->
                            </tr>
                            <!-- ko if: isExpanded -->
                            <tr>
                                <td></td>
                                <td data-bind="attr:{colspan: $parent.Columns.length }">
                                    <!-- ko if: DrillDownData -->
                                    <table class="table table-hover table-condensed" data-bind="with: DrillDownData">
                                        <thead>
                                            <tr class="no-highlight">
                                                <!-- ko foreach: Columns -->
                                                <th>
                                                    <a href="" data-bind="click: function(){ $parents[1].changeSort(SqlField); }">
                                                        <span data-bind="text: ColumnName"></span>
                                                        <span data-bind="text: $parents[1].pager.sortColumn() === SqlField ? ($parents[1].pager.sortDescending() ? '&#9660;' : '&#9650;') : ''">
                                                        </span>
                                                    </a>
                                                </th>
                                                <!-- /ko -->
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style="display: none;" data-bind="visible: Rows.length < 1">
                                                <td class="text-info" data-bind="attr:{colspan: Columns.length}">
                                                    No records found
                                                </td>
                                            </tr>
                                            <!-- ko foreach: Rows  -->
                                            <tr>
                                                <!-- ko foreach: Items -->
                                                <td data-bind="html: FormattedValue"></td>
                                                <!-- /ko -->
                                            </tr>
                                            <!-- /ko -->
                                        </tbody>
                                    </table>
                                    <div class="col-xs-12 col-centered" data-bind="with: pager">
                                        <div class="form-inline small text-muted">
                                            <div class="pull-left total-records" data-bind="visible: pages()">
                                                <span data-bind="text: 'Total Records: ' + totalRecords()"></span>
                                            </div>
                                            <div class="pull-left">
                                            </div>
                                            <div class="form-group pull-right" data-bind="visible: pages()">
                                                <div data-bind="template: 'pager-template', data: $data"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                </td>
                            </tr>
                            <!-- /ko -->
                            <!-- /ko -->
                        </tbody>
                    </table>
                </div>
        </script>`);

        this.reportScheduleTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="report-schedule">
                <div data-bind="with: scheduleBuilder">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-bind="checked: hasSchedule" />
                            Schedule Report
                        </label>
                    </div>
                    <div data-bind="if: hasSchedule">
                        <div class="form-inline form-group">

                            Every&nbsp;<select class="form-control" required
                                data-bind="options: options, value: selectedOption"></select>
                            <div data-bind="if: showDays">
                                &nbsp;on&nbsp;<select multiple class="form-control" required style="width: 30%;"
                                    data-bind="select2: { placeholder: 'Choose Days', allowClear: true }, options: days, selectedOptions: selectedDays"></select>
                            </div>
                            <div data-bind="if: showDates">
                                &nbsp;on&nbsp;<select multiple class="form-control" required style="width: 30%;"
                                    data-bind="select2: { placeholder: 'Choose Dates', allowClear: true }, options: dates, selectedOptions: selectedDates"></select>
                            </div>
                            <div data-bind="if: showMonths">
                                &nbsp;of&nbsp;<select multiple class="form-control" required style="width: 30%;"
                                    data-bind="select2: { placeholder: 'Choose Months', allowClear: true }, options: months, selectedOptions: selectedMonths"></select>
                            </div>
                            <div data-bind="if: showAtTime">
                                &nbsp;at&nbsp;<select class="form-control"
                                    data-bind="options: hours, value: selectedHour"></select>
                                <select class="form-control" data-bind="options: minutes, value: selectedMinute"></select>
                                <select class="form-control" data-bind="value: selectedAmPm">
                                    <option>AM</option>
                                    <option>PM</option>
                                </select>
                            </div>
                        </div>
                        <div class="alert alert-info">
                            Report will be run and emailed every <span data-bind="text: selectedOption"></span>
                            <div data-bind="if: showDays">
                                on <span class="error" data-bind="visible: selectedDays().length == 0">Please pick Day(s)</span>
                                <span data-bind="text: selectedDays"></span>
                            </div>
                            <div data-bind="if: showDates">
                                on <span class="error" data-bind="visible: selectedDates().length == 0">Please pick
                                    Date(s)</span>
                                <span data-bind="foreach: selectedDates"><span data-bind="visible: $index()>0">, </span><span
                                        data-bind="text: $data == 1 ? '1st': ($data == 2 ? '2nd' : ($data == 3 ? '3rd' : $data+'th'))"></span></span>
                            </div>
                            <div data-bind="if: showMonths">
                                of <span class="error" data-bind="visible: selectedMonths().length == 0">Please pick
                                    Month(s)</span> <span data-bind="text: selectedMonths"></span>
                            </div>
                            <div data-bind="if: showAtTime">
                                at <span data-bind="text: selectedHour"></span>:<span data-bind="text: selectedMinute"></span>
                                <span data-bind="text: selectedAmPm"></span>
                            </div>
                        </div>
                        <div class="form-horizontal form-group">
                            <div class="form-group row">
                                <label class="col-sm-2 control-label">Email to</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" style="width: 100%;" data-bind="value: emailTo"
                                        placeholder="Enter Email Addresses separated by comma to send the Report to" required />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </script>`);

        this.flyFiltersTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="fly-filter-template">
            <div class="card" data-bind="visible: FlyFilters().length>0">
                <div class="card-header">
                    <h5 class="card-title">
                        <a data-toggle="collapse" data-target="#filter-panel" href="#">
                            <i class="fa fa-filter"></i> Choose filter options
                        </a>
                    </h5>
                </div>
                <div style="display: none" id="filter-panel" class="card-body">
                    <div>
                        <div data-bind="foreach: FlyFilters">
                            <div class="row">

                                <div class="col-sm-5 col-xs-4">
                                    <div data-bind="with: Field" class="checkbox">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" title="Apply this filter"
                                                    data-bind="checked: $parent.Apply" /><span
                                                    data-bind="text: selectedFieldName"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div data-bind="with: Field" class="col-sm-2 col-xs-3">
                                    <div class="form-group" data-bind="if: $parent.Apply">
                                        <select class="form-control"
                                            data-bind="options: fieldFilter, value: $parent.Operator" required></select>
                                    </div>
                                </div>
                                <div data-bind="with: Field" class="col-xs-5">
                                    <div data-bind="if: $parent.Apply">
                                        <div data-bind="template: 'report-filter', data: $data"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-primary" data-bind="click: RunReport">Refresh Report</button>
                    </div>
                </div>
            </div>
        </script>`
        );

        this.manageAccessTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="manage-access-template">
                <h5><span class="fa fa-key"></span> Manage Access</h5>
                <div class="panel panel-default panel-body" style="margin-left: 20px;">
                    <div class="alert alert-info">
                        <span class="fa fa-lightbulb-o fa-2x"></span> &nbsp;User level rights over rule Role level rights. No
                        selection for a rule implies report is available to all.
                    </div>
                    <b>Manage by User</b> (allow edit/delete)
                    <div class="row container-fluid">
                        <div data-bind="foreach: manageAccess.users">
                            <div class="pull-left">
                                <div class="checkbox">
                                    <label class="label label-info">
                                        <input type="checkbox" data-bind="checked: selected">&nbsp;<span
                                            data-bind="text: value"></span>&nbsp;
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <b>View only by User</b> (no edit/delete)
                    <div class="row container-fluid">
                        <div data-bind="foreach: manageAccess.viewOnlyUsers">
                            <div class="pull-left">
                                <div class="checkbox">
                                    <label class="label label-info">
                                        <input type="checkbox" data-bind="checked: selected">&nbsp;<span
                                            data-bind="text: value"></span>&nbsp;
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <b>Manage by User Role</b> (allow edit/delete)
                    <div class="row container-fluid">
                        <div data-bind="foreach: manageAccess.userRoles">
                            <div class="pull-left">
                                <div class="checkbox">
                                    <label class="label label-info">
                                        <input type="checkbox" data-bind="checked: selected">&nbsp;<span
                                            data-bind="text: value"></span>&nbsp;
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <b>View only by User Role</b> (no edit/delete)
                    <div class="row container-fluid">
                        <div data-bind="foreach: manageAccess.viewOnlyUserRoles">
                            <div class="pull-left">
                                <div class="checkbox">
                                    <label class="label label-info">
                                        <input type="checkbox" data-bind="checked: selected">&nbsp;<span
                                            data-bind="text: value"></span>&nbsp;
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
        </script>`);

        this.adminModeTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="admin-mode-template">
            <div class="row" style="padding: 10px 10px">
                <div class="material-switch pull-right">
                    <input id="admin-mode" type="checkbox" data-bind="checked: adminMode" />
                    <label for="admin-mode" class="label-primary"></label>
                </div>
                <div class="pull-right">Admin Mode</div>
            </div>

            <div class="alert alert-info" data-bind="visible: adminMode">
                <i class="fa fa-user-circle"></i> Admin Mode is turned on now, it allows you to setup and view Reports or
                Dashboards for all roles and users. You should remove the Admin mode toggle for non-admin users.<br />
            </div>
        </script>`);

        this.pagerTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="pager-template">
                <div class="pager-container">
                    <a href="" title="first" data-bind="click: first, enable: !isFirstPage()"><i
                            class="fa fa-backward report-pager-btn" style="font-size: 18px;"></i></a>&nbsp;
                    <a href="" title="previous" data-bind="click: previous, enable: !isFirstPage()"><i
                            class="fa fa-caret-left fa-2x report-pager-btn"></i></a>

                    <span class="pager-pageinfo">
                        <span>Page</span>&nbsp;
                        <input type="number" min="1" pattern="[0-9]*" class="text-center" data-bind="
                                            value: currentPage,
                                            attr: { max: pages() }" />&nbsp;
                        <span>of</span>&nbsp;
                        <span data-bind="text: pages"></span>
                    </span>&nbsp;

                    <a href="" title="next" data-bind="click: next, enable: !isLastPage()"><i
                            class="fa fa-caret-right fa-2x report-pager-btn"></i></a>&nbsp;
                    <a href="" title="last" data-bind="click: last, enable: !isLastPage()"><i
                            class="fa fa-forward report-pager-btn" style="font-size: 18px;"></i></a>
                </div>
        </script>`);

        this.filterGroupTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="filter-group">
                <div data-bind="foreach: FilterGroups">
                    <div class="card" style="margin-left: 20px;">
                        <div class="card-body" data-bind="visible: !isRoot">
                            <select data-bind="value: AndOr" class="form-control form-control-sm pull-left">
                                <option>And</option>
                                <option>Or</option>
                            </select>
                            <button class="btn btn-sm btn-secondary pull-left"
                                data-bind="click: $parent.RemoveFilterGroup, visible: !isRoot">Remove Group</button>&nbsp;
                            <hr />
                        </div>
                        <div data-bind="template: {name: 'filter-inner', data: $data}"></div>
                    </div>
                </div>
        </script>`);

        this.reportFilterTemplate = this.sanitizer.bypassSecurityTrustHtml(`<script type="text/html" id="report-filter">
                <div class="form-group">
                    <div data-bind="if: !hasForeignKey">
                        <div data-bind="if: fieldType=='DateTime'">
                            <div data-bind="if: ['=','>','<','>=','<='].indexOf($parent.Operator()) != -1">
                                <input class="form-control" data-bind="datepicker: $parent.Value" required />
                            </div>
                            <div data-bind="if: ['between'].indexOf($parent.Operator()) != -1">
                                From <input required class="form-control" data-bind="datepicker: $parent.Value" /> to <input
                                    data-bind="datepicker: $parent.Value2" class="form-control" required />
                            </div>
                            <div data-bind="if: ['range'].indexOf($parent.Operator()) != -1">
                                <select data-bind="value: $parent.Value" class="form-control">
                                    <option>Today</option>
                                    <option>This Week</option>
                                    <option>Last Week</option>
                                    <option>This Month</option>
                                    <option>Last Month</option>
                                    <option>This Year</option>
                                    <option>Last Year</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                        <div data-bind="if: ['Int','Money','Float'].indexOf(fieldType) != -1">
                            <div data-bind="if: ['=','>','<','>=','<='].indexOf($parent.Operator()) != -1">
                                <input class="form-control" type="number" data-bind="value: $parent.Value" required />
                            </div>
                            <div data-bind="if: ['between'].indexOf($parent.Operator()) != -1">
                                From <input class="form-control" type="number" data-bind="value: $parent.Value" required /> to
                                <input class="form-control" type="number" data-bind="value: $parent.Value2" required />
                            </div>
                        </div>
                        <div data-bind="if: fieldType=='Boolean'">
                            <select required class="form-control" data-bind="value: $parent.Value">
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                        <div data-bind="if: ['Int','Money','Float','Date','DateTime','Boolean'].indexOf(fieldType) == -1">
                            <div data-bind="if: ['is blank', 'is not blank'].indexOf($parent.Operator()) < 0">
                                <input class="form-control" type="text" data-bind="value: $parent.Value" required />
                            </div>
                        </div>
                    </div>
                    <div data-bind="if: hasForeignKey">
                        <div data-bind="if: $parent.Operator()=='='">
                            <select required class="form-control"
                                data-bind="select2: { placeholder: 'Please Choose', allowClear: true, multiple: false }, options: $parent.LookupList, optionsText:'text', optionsValue:'id', value: $parent.Value"></select>
                        </div>
                        <div data-bind="if: $parent.Operator()=='in' || $parent.Operator()=='not in'">
                            <select multiple class="form-control"
                                data-bind="select2: { placeholder: 'Please Choose', allowClear: true }, options: $parent.LookupList, optionsText:'text', optionsValue:'id', selectedOptions: $parent.ValueIn"></select>
                        </div>
                    </div>
                </div>
        </script>`);

        this.filterInnerTemplate = this.sanitizer.bypassSecurityTrustHtml(` <script type="text/html" id="filter-inner">
            <div class="table-responsive">
                <table class="table  table-hover table-borderless" data-bind="visible: Filters().length>0">
                    <thead>
                        <tr>
                            <th style="width: 10%"></th>
                            <th style="width: 30%">Field</th>
                            <th style="width: 10%"></th>
                            <th style="width: 30%">Filter</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody data-bind="foreach: Filters">
                        <tr>
                            <td>
                                <select data-bind="value: AndOr, visible: $index()>0" class="form-control">
                                    <option>And</option>
                                    <option>Or</option>
                                </select>
                            </td>
                            <td>
                                <div class="form-group">
                                    <select class="form-control" style="width: 100%;"
                                        data-bind="options: $root.selectedFieldsCanFilter, optionsText: 'selectedFieldName', optionsCaption: 'Please Choose', value: Field, attr: {required: Field()==null?'required':false}"></select>
                                </div>
                            </td>
                            <td data-bind="with: Field">
                                <div class="form-group">
                                    <select class="form-control" style="width: 100%;"
                                        data-bind="options: fieldFilter, value: $parent.Operator" required></select>
                                </div>
                            </td>
                            <td data-bind="with: Field">
                                <div data-bind="template: 'report-filter', data: $data"></div>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-secondary"
                                    data-bind="click: $parent.RemoveFilter">Remove</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        <div data-bind="template: {name: 'filter-group'}"></div>
        <div>
            <button class="btn btn-sm btn-link" data-bind="click: AddFilterGroup">Add Group</button>&nbsp;
            <button class="btn btn-sm btn-link" data-bind="click: AddFilter">Add Filter</button>
        </div>
    </script>`);

        this.cdref.detectChanges();
    };

    private bindWindowResize(vm: any): void {
        $(window).resize(function () {
            if (vm.reportMode == "execute") {
                vm.DrawChart()
            };
        });
    }
}
