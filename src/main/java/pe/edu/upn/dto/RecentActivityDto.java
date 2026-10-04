package pe.edu.upn.dto;

public class RecentActivityDto {
    private final String title;
    private final String detail;

    public RecentActivityDto(String title, String detail) {
        this.title = title;
        this.detail = detail;
    }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
}
