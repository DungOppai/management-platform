import type { Project } from '../types/project';

export const projects: Project[] = [
{
  id: 'p1',
  code: 'DLK',
  name: 'Ứng dụng Đặt lịch Khám',
  dueDate: '2026-12-15',
  memberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']
},
{
  id: 'p2',
  code: 'SV',
  name: 'Cổng thông tin Sinh viên',
  dueDate: '2027-01-20',
  memberIds: ['m1', 'm2', 'm4']
},
{
  id: 'p3',
  code: 'KHO',
  name: 'Hệ thống Quản lý Kho',
  dueDate: '2026-12-30',
  memberIds: ['m1', 'm3', 'm6']
}];