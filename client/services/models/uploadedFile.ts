import {Model} from '../../model';

export class UploadedFile extends Model {
    id: number;
    project_name: string;
    platform: string;
    service_type: string;
    version: string;
    build_datetime: any;
    comment: string;
    permalink: string;
    alias: string;

    uploaded_date: any;
    uploaded_by: number;
    project_id: number;
    ip_address : string;
    file_name : string;
    is_public: boolean;
    is_active: boolean;
    modified_date: any;
    modified_by: number;
    created_date: any;
    created_by: number;

    attributeNames: string[] = ['id', 'project_name', 'platform', 'service_type', 'version', 'build_datetime', 'uploaded_date', 'uploaded_by', 'comment', 'permalink','alias', 'project_id', 'ip_address', 'file_name', 'is_public', 'is_active', 'modified_date', 'modified_by','created_date', 'created_by'];
}