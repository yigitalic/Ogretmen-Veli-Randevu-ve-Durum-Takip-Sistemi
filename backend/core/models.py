from django.db import models
from django.contrib.auth.models import AbstractUser

# ==========================================
# 1. KULLANICI VE HİYERARŞİ MODELLERİ
# ==========================================

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Sistem Yöneticisi'),
        ('manager', 'İl/İlçe/Okul Yöneticisi'),
        ('teacher', 'Öğretmen'),
        ('parent', 'Veli'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='parent')
    tc_kimlik = models.CharField(max_length=11, unique=True, null=True, blank=True)

class Region(models.Model):
    name = models.CharField(max_length=100) # Örn: Marmara

class Province(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='provinces')

class District(models.Model):
    name = models.CharField(max_length=100)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='districts')

class School(models.Model):
    LEVEL_CHOICES = (
        ('ilkokul', 'İlkokul'),
        ('ortaokul', 'Ortaokul'),
        ('lise', 'Lise'),
    )
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='schools')
    education_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='ilkokul')
    manager = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'manager'})

# ==========================================
# 2. ÖĞLETMEN, VELİ VE ÖĞRENCİ İLİŞKİLERİ
# ==========================================

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='teachers')
    max_randevu_kotasi = models.IntegerField(default=3, help_text="Aynı anda maksimum kabul edilebilecek veli sayısı")

class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'parent'})
    phone_number = models.CharField(max_length=15, blank=True, null=True)

class Student(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_number = models.CharField(max_length=20)
    parents = models.ManyToManyField(Parent, related_name='students')
    teachers = models.ManyToManyField(Teacher, related_name='students')

# ==========================================
# 3. ANA OPERASYON MODELLERİ (Randevu, Mesaj, Log)
# ==========================================

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Bekliyor'),
        ('approved', 'Onaylandı'),
        ('rejected', 'Reddedildi'),
        ('rescheduled', 'Saat Önerildi'),
    )
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name='appointments')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='appointments')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='appointments')
    
    requested_time = models.DateTimeField()
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    teacher_note = models.TextField(blank=True, null=True, help_text="Reddetme veya saat önerme sebebi")
    created_at = models.DateTimeField(auto_now_add=True)

class StudentBehaviorLog(models.Model):
    LOG_TYPES = (
        ('positive', 'Olumlu'),
        ('negative', 'Olumsuz / Uyarı'),
        ('info', 'Bilgilendirme'),
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='behavior_logs')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='behavior_logs')
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField(blank=True, null=True)
    is_template = models.BooleanField(default=False, help_text="Hazır şablon mesajı mı?")
    attachment_url = models.URLField(blank=True, null=True, help_text="Ödev vb. dosya yüklemeleri için link")
    created_at = models.DateTimeField(auto_now_add=True)

class TeacherSchedule(models.Model):
    DAY_CHOICES = (
        (0, 'Pazartesi'),
        (1, 'Salı'),
        (2, 'Çarşamba'),
        (3, 'Perşembe'),
        (4, 'Cuma'),
        (5, 'Cumartesi'),
        (6, 'Pazar'),
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('teacher', 'day_of_week')

    def __str__(self):
        return f"{self.teacher.user.get_full_name()} - {self.get_day_of_week_display()}"
