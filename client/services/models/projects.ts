import {Model} from '../../model';

export class Projects extends Model {
    id: number;
    project_name: string;
    project_code: string;
    file_count: number;
    is_public: boolean;
    is_active: boolean;
    modified_date: any;
    modified_by: number;
    created_date: any;
    created_by: number;

    attributeNames: string[] = ['id', 'project_name', 'project_code', 'is_public', 'is_active'];
}