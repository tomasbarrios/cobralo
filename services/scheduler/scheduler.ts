import * as corn from "node-cron";

export interface IScheduler {
  success: boolean;
  error: undefined | Error
}

export abstract class Scheduler {
  private scheduleTime: string;
  private onSuccess: Function;

  private task: any;

  private options: corn.ScheduleOptions = {
    scheduled: true,
  };

  constructor(timeToExecute: string, onSuccess: Function) {
    this.scheduleTime = timeToExecute;
    this.onSuccess = onSuccess
    this.initiateScheduler();
  }

  private initiateScheduler() {
    console.log("init initiateScheduler")

    const isJobValidated = corn.validate(this.scheduleTime);

    if (isJobValidated) {
      this.task = corn.schedule(
        this.scheduleTime,
        this.taskInitializer,
        this.options
      );
    }

    this.task.start();
  }

  taskInitializer = async () => {
    const job: IScheduler = await this.executeJob();

    if (job.success) {
      console.log("Job Successfully executed");
      if(this.onSuccess) {
        this.onSuccess(job)
      }
    } else {
      console.log("Job Error at execution");

      job.error = new Error("Error to execute the scheduled job");
    }
  };

  abstract executeJob(): Promise<IScheduler>;
}
