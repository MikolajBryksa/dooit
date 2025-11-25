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
# REACT NATIVE CONFIG (react-native-config)
########################################
-keep class com.lugg.RNCConfig.** { *; }

########################################
# REALM (wg dokumentacji)
########################################
-keep class io.realm.annotations.RealmModule
-keep @io.realm.annotations.RealmModule class *
-keep class io.realm.internal.Keep
-keep @io.realm.internal.Keep class *
-keep class io.realm.** { *; }
-dontwarn io.realm.**

########################################
# KOTLIN / COROUTINES / SERIALIZATION
########################################
# Ogólnie lepiej nie obfuskować standardowych klas Kotlina
-keep class kotlin.** { *; }
-keep class kotlinx.coroutines.** { *; }
-keep class kotlinx.serialization.** { *; }

-keepclasseswithmembers class * {
    @kotlinx.serialization.Serializable *;
}

########################################
# SUPABASE KOTLIN / KTOR
########################################
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
# JSON SERIALIZATION / METADANE
########################################
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes EnclosingMethod

########################################
# NATIVE METHODS
########################################
-keepclasseswithmembernames class * {
    native <methods>;
}

########################################
# CUSTOM CLASSES
########################################
-keep class com.dooit.bryksa.model.** { *; }
