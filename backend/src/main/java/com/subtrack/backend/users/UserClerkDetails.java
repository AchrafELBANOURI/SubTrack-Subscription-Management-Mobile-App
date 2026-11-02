package com.subtrack.backend.users;

public record UserClerkDetails(String email, String firstName, String lastName) {
    public static class UserClerkDetailsBuilder {
        private String email;
        private String firstName;
        private String lastName;

        private UserClerkDetailsBuilder() {
        }

        public static UserClerkDetailsBuilder builder() {
            return new UserClerkDetailsBuilder();
        }

        public UserClerkDetailsBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserClerkDetailsBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserClerkDetailsBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserClerkDetails build() {
            return new UserClerkDetails(email, firstName, lastName);
        }
    }
}