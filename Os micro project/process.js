class Process {
    constructor(pid, arrivalTime, burstTime) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.remainingTime = burstTime;
        this.waitingTime = 0;
        this.completionTime = 0;
        this.started = false;
    }
    
    execute() {
        this.remainingTime--;
    }
    
    isCompleted() {
        return this.remainingTime === 0;
    }
}