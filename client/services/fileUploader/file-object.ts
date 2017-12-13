import {UploadedFile} from "../models/uploadedFile";
function isElement(node:any):boolean {
  return !!(node && (node.nodeName || node.prop && node.attr && node.find));
}

export class FileObject {
    public lastModifiedDate:any;
    public size:any;
    public type:string;
    public name:string;
    public file:File;

    private uploadedFile: UploadedFile;

    public valid: Boolean = true;

    public constructor(input:any) {

        let fakePathOrObject = isElement(input) ? input.value : input;
        let postfix = typeof fakePathOrObject === 'string' ? 'FakePath' : 'Object';
        let method = '_createFrom' + postfix;
        (this as any)[method](fakePathOrObject);
        this.file = input;

        this.uploadedFile = new UploadedFile;

        var fileNameWithoutExtension = this.name;
        var extSplit = this.name.split(".");
        if (extSplit.length > 1) {
            fileNameWithoutExtension = extSplit.slice(0, -1).join('.');
            var extension = extSplit[extSplit.length - 1];
            if (extension === 'ipa') {
                this.uploadedFile.platform = 'IOS'
            }
            else if (extension === 'apk') {
                this.uploadedFile.platform = 'AOS'
            }
            else {
                this.valid = false;
                return;
            }
        }

        var splits = fileNameWithoutExtension.split("_");
        if(splits.length == 6) {
            
            this.uploadedFile.project_name = splits[0];
            this.uploadedFile.version = splits[1];
            this.uploadedFile.service_type = splits[2];
            var datetime = new Date(parseInt(splits[3].substring(0, 4)), parseInt(splits[3].substring(4, 6)) - 1, parseInt(splits[3].substring(6, 8)), parseInt(splits[4].substring(0, 2)), parseInt(splits[4].substring(2, 4)));
            this.uploadedFile.build_datetime = this.toJSONLocal(datetime);
            this.uploadedFile.comment = splits[5];
        }

        this.uploadedFile.file_name = this.name;
        this.name = encodeURI(this.name);
    }

    toJSONLocal (date) {
        var local = new Date(date);
        local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return local.toJSON().slice(0, 16);
    }

    public _createFromFakePath(path:string):void {
        this.lastModifiedDate = void 0;
        this.size = void 0;
        this.type = 'like/' + path.slice(path.lastIndexOf('.') + 1).toLowerCase();
        this.name = path.slice(path.lastIndexOf('/') + path.lastIndexOf('\\') + 2);
    }

    public _createFromObject(object:{size: number, type: string, name: string}):void {
        this.size = object.size;
        this.type = object.type;
        this.name = object.name;
    }

    public getUploadedFile()
    {
        return this.uploadedFile;
    }
}
