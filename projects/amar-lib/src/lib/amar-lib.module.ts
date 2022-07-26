import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BASE_URL_TOKEN } from './amar_lib.di';
import { DotnetreportComponent } from './dotnetreport.component';


@NgModule({
  declarations: [
    DotnetreportComponent,
  ],
  imports: [
    BrowserAnimationsModule
  ],
  exports: [
    DotnetreportComponent,
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
