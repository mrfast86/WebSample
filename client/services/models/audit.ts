export class Audit {
    id: number;
    file_id: number;
    pvid: string;
    ip_address: string;
    audit_date: any;
    action: string;

    constructor(fileId: number, action: string) {
        this.file_id = fileId;
        this.action = action;
    }
}