########################################
# REACT NATIVE / HERMES
########################################
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

########################################
# REACT NATIVE CONFIG
########################################
-keep class com.lugg.RNCConfig.** { *; }

########################################
# REALM
########################################
-keep class io.realm.annotations.RealmModule
-keep @io.realm.annotations.RealmModule class *
-keep class io.realm.internal.Keep
-keep @io.realm.internal.Keep class *
-keep class io.realm.** { *; }
-dontwarn io.realm.**

########################################
# KOTLIN / SUPABASE
########################################
-dontwarn kotlin.**
-dontwarn kotlinx.**

########################################
# GSON
########################################
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

########################################
# JSON SERIALIZATION
########################################
-keepattributes Signature
-keepattributes *Annotation*

########################################
# KEEP NATIVE METHODS
########################################
-keepclasseswithmembernames class * {
    native <methods>;
}

########################################
# CUSTOM CLASSES
########################################
-keep class com.dooit.bryksa.model.** { *; }

