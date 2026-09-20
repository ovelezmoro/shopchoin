import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Branch } from '../models/shopchain.models';
import { BRANCHES } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class BranchService {
  getBranches(): Observable<Branch[]> {
    return of(BRANCHES.map((b) => ({ ...b })));
  }

  save(branch: Branch): Observable<Branch> {
    const i = BRANCHES.findIndex((b) => b.id === branch.id);
    i >= 0 ? BRANCHES.splice(i, 1, branch) : BRANCHES.push({ ...branch, id: Date.now() });
    return of(branch);
  }
}
