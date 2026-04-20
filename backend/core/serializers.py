from rest_framework import serializers
from .models import User, Region, Province, District, School, Teacher, Parent, Student, Appointment, StudentBehaviorLog, Message, TeacherSchedule
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'tc_kimlik']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Teacher
        fields = '__all__'

class ParentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Parent
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    parents = ParentSerializer(many=True, read_only=True)
    class Meta:
        model = Student
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

    def validate(self, data):
        requested_time = data.get('requested_time')
        teacher = data.get('teacher')
        
        if requested_time:
            now = timezone.now()
            
            # 1. Gelecek tarih kontrolü
            if requested_time < now:
                raise serializers.ValidationError("Geçmiş bir tarihe randevu alamazsınız.")
            
            # 2. 8 günlük pencere kontrolü (Bugün + 7 gün)
            max_date = now + timezone.timedelta(days=7)
            if requested_time.date() > max_date.date():
                raise serializers.ValidationError("En fazla 1 hafta sonrasına kadar randevu alabilirsiniz.")
            
            # 3. Haftasonu kontrolü
            if requested_time.weekday() >= 5: # 5=Cumartesi, 6=Pazar
                raise serializers.ValidationError("Hafta sonları randevu alınamaz.")
            
            # 4. Öğretmenin çalışma günü kontrolü
            schedule = TeacherSchedule.objects.filter(teacher=teacher, day_of_week=requested_time.weekday()).first()
            if schedule and not schedule.is_available:
                raise serializers.ValidationError(f"Bu öğretmen {requested_time.strftime('%A')} günleri randevu kabul etmemektedir.")
            
        return data

class StudentBehaviorLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentBehaviorLog
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
