import React, { useEffect, useState } from 'react';
import { academicService } from '../../services/api';
import { BookOpen, Clock, Building2, Layers } from 'lucide-react';

const CourseConfigView = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    academicService.getCourses().then((res) => {
      if (res.success) setCourses(res.courses);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Programs & Courses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Catalog of degree programs, duration rules, and base fee structures configured for admission
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading courses...</div>
        ) : courses.map((course) => (
          <div
            key={course._id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded-md">
                  {course.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {course.departmentId?.name || 'Department'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3">{course.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>{course.durationYears} Years</strong> ({course.totalSemesters} Semesters)
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 justify-end">
                <span className="font-mono font-bold text-emerald-700">
                  ₹{(course.baseAnnualFee || 0).toLocaleString()} / Yr
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseConfigView;
