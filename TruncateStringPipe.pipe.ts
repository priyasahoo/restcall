import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "truncateString" })
export class TruncateStringPipe implements PipeTransform {
  transform(value: string, args: string): string {
    let limit = args ? parseInt(args) : 10;
    return value.length > limit ? value.substring(0, limit) + "..." : value;
  }
}
