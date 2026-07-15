import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ParticipantsModule } from './participants/participants.module';
import { MeasuresModule } from './measures/measures.module';
import { TrainersModule } from './trainers/trainers.module';
import { CoursesModule } from './courses/courses.module';
import { SessionsModule } from './sessions/sessions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DocumentsModule } from './documents/documents.module';
import { CapaModule } from './capa/capa.module';
import { AuditModule } from './audit/audit.module';
import { AlumniModule } from './alumni/alumni.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AutomationsModule } from './automations/automations.module';
import { AinoModule } from './aino/aino.module';
import { PdfModule } from './pdf/pdf.module';
import { QmDocsModule } from './qm-docs/qm-docs.module';
import { CategoriesModule } from './categories/categories.module';
import { ParticipantRecordsModule } from './participant-records/participant-records.module';
import { DiaryEntriesModule } from './diary-entries/diary-entries.module';
import { SurveysModule } from './surveys/surveys.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { CourseRecordsModule } from './course-records/course-records.module';
import { TrainerQualificationsModule } from './trainer-qualifications/trainer-qualifications.module';
import { LessonProgressModule } from './lesson-progress/lesson-progress.module';
import { PlacementFollowUpModule } from './placement-follow-up/placement-follow-up.module';
import { CourseEvaluationsModule } from './course-evaluations/course-evaluations.module';
import { EquipmentLoansModule } from './equipment-loans/equipment-loans.module';
import { SupportModule } from './support/support.module';
import { QuizModule } from './quiz/quiz.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate: validateEnv }),
    PrismaModule, MailModule, StorageModule, JobsModule, AuthModule,
    TenantsModule, UsersModule, ParticipantsModule, MeasuresModule,
    TrainersModule, CoursesModule, SessionsModule, QmDocsModule, AttendanceModule,
    DocumentsModule, CapaModule, AuditModule, AlumniModule,
    CampaignsModule, AutomationsModule, CategoriesModule, AinoModule,
    PdfModule, ParticipantRecordsModule, DiaryEntriesModule,
    SurveysModule, EvaluationsModule, CourseRecordsModule,
    TrainerQualificationsModule, LessonProgressModule,
    PlacementFollowUpModule, CourseEvaluationsModule, EquipmentLoansModule,
    SupportModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD,       useClass: JwtAuthGuard },
    { provide: APP_GUARD,       useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER,      useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}