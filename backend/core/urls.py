from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TeacherViewSet, ParentViewSet, StudentViewSet, AppointmentViewSet, StudentBehaviorLogViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'parents', ParentViewSet)
router.register(r'students', StudentViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'behavior-logs', StudentBehaviorLogViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
