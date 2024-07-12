import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// TODO : switch
//import { BASE_URL_TOKEN } from './dotnetreport-lib.di';
import { DotnetdashboardComponent } from './dotnetdashboard/dotnetdashboard.component';
import { DotnetsetupComponent } from './dotnetsetup/dotnetsetup.component';
import { DotnetreportComponent } from './dotnetreport/dotnetreport.component';
import { BASE_URL_TOKEN } from './amar_lib.di';


@NgModule({
  declarations: [
    DotnetreportComponent,
    DotnetdashboardComponent,
    DotnetsetupComponent
  ],
  imports: [
    BrowserAnimationsModule
  ],
  exports: [
    DotnetreportComponent,
    DotnetdashboardComponent,
    DotnetsetupComponent
  ]
})
export class AmarLibModule {

  static forRoot(base_url : string) : ModuleWithProviders<AmarLibModule> {
    return {
      ngModule : AmarLibModule,
      providers: [
        {
          provide : BASE_URL_TOKEN,
          useValue : base_url
        }
      ]
    }
  }
 }
