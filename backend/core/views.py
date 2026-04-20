from rest_framework import viewsets
from .models import User, Teacher, Parent, Student, Appointment, StudentBehaviorLog, Message
from .serializers import UserSerializer, TeacherSerializer, ParentSerializer, StudentSerializer, AppointmentSerializer, StudentBehaviorLogSerializer, MessageSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

class StudentBehaviorLogViewSet(viewsets.ModelViewSet):
    queryset = StudentBehaviorLog.objects.all()
    serializer_class = StudentBehaviorLogSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
