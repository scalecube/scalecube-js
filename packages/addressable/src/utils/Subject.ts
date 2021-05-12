/*
 * Subject for poor
 */
export class Subject {
  private values: any = {};
  private subscribers: Array<(arg: any) => void> = [];

  public next(value: any) {
    this.values = { ...value };
    this.notify();
  }
  public subscribe(fn: (arg: any) => void) {
    this.subscribers.push(fn);
    fn({ ...this.values });
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== fn);
    };
  }
  protected notify() {
    for (const sub of this.subscribers) {
      sub({ ...this.values });
    }
  }
}
