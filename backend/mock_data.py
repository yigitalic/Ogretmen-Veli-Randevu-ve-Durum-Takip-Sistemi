import os
import django
from django.utils import timezone
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, School, Teacher, Parent, Student, StudentBehaviorLog, Appointment, District, Province, Region

def populate():
    # Temizleme
    User.objects.exclude(username='admin').delete()
    Region.objects.all().delete()
    
    # Hiyerarşi
    region = Region.objects.create(name='Marmara')
    province = Province.objects.create(name='Istanbul', region=region)
    district = District.objects.create(name='Kadikoy', province=province)
    school = School.objects.create(name='Ataturk Ilkokulu', district=district)
    
    # Kullanıcılar
    teacher_user = User.objects.create_user(username='elifyilmaz', password='password123', role='teacher', first_name='Elif', last_name='Yılmaz')
    parent_user = User.objects.create_user(username='arzukaya', password='password123', role='parent', first_name='Arzu', last_name='Kaya')
    
    # Role Modelleri
    teacher = Teacher.objects.create(user=teacher_user, school=school, max_randevu_kotasi=3)
    parent = Parent.objects.create(user=parent_user)
    
    # Öğrenci
    student = Student.objects.create(school=school, first_name='Ahmet', last_name='Kaya', student_number='1024')
    student.parents.add(parent)
    student.teachers.add(teacher)
    
    # API'de Veli Panelinde görünecek canlı Davranış Logu
    StudentBehaviorLog.objects.create(
        teacher=teacher,
        student=student,
        log_type='negative',
        title='API GEÇİŞİ BAŞARILI: Uyumsuzluk',
        description='Ahmet son derste dikkat eksikliği yaşadı. *Bu veri doğrudan PostgreSQL veritabanından Canlı (API API) olarak çekildi!*'
    )
    
    # API'de Öğretmen Panelinde görünecek Randevu Talebi
    Appointment.objects.create(
        parent=parent,
        teacher=teacher,
        student=student,
        requested_time=timezone.now() + datetime.timedelta(days=1),
        subject='Sınav Notları ve Davranış',
        description='Hocam merhaba, çocuğumun son durumu (API verisi) hakkında görüşmek isterim.',
        status='pending'
    )
    print("Test verileri başarıyla sisteme (DB) eklendi!")

if __name__ == '__main__':
    populate()
