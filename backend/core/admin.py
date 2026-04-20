from django.contrib import admin
from .models import User, Region, Province, District, School, Teacher, Parent, Student, Appointment, StudentBehaviorLog, Message, TeacherSchedule

# Tüm veri haritası, tarayıcı üzerinden Görsel olarak okunabilsin diye Sisteme Kaydedildi.
admin.site.register(User)
admin.site.register(Region)
admin.site.register(Province)
admin.site.register(District)
admin.site.register(School)
admin.site.register(Teacher)
admin.site.register(Parent)
admin.site.register(Student)
admin.site.register(Appointment)
admin.site.register(StudentBehaviorLog)
admin.site.register(Message)
admin.site.register(TeacherSchedule)
