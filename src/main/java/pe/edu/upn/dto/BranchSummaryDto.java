package pe.edu.upn.dto;

public class BranchSummaryDto {
    private final String branch;
    private final int percentage;

    public BranchSummaryDto(String branch, int percentage) {
        this.branch = branch;
        this.percentage = percentage;
    }
    public String getBranch() { return branch; }
    public int getPercentage() { return percentage; }
}
