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

-keep class kotlin.** { *; }
-keep class kotlinx.coroutines.** { *; }
-keep class kotlinx.serialization.** { *; }
-keepclasseswithmembers class * {
    @kotlinx.serialization.Serializable *;
}

-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

-keep class io.ktor.** { *; }
-dontwarn io.ktor.**

########################################
# OKHTTP / OKIO / RETROFIT
########################################
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

-keep class okio.** { *; }
-dontwarn okio.**

-keep class retrofit2.** { *; }
-dontwarn retrofit2.**

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
